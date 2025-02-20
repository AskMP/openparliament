import datetime
import re
import urllib

from django.contrib.markup.templatetags.markup import markdown
from django.contrib.syndication.views import Feed
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator, InvalidPage, EmptyPage
from django.http import HttpResponse, Http404, HttpResponseRedirect, HttpResponsePermanentRedirect
from django.utils.http import urlquote
from django.shortcuts import get_object_or_404
from django.template import Context, loader, RequestContext
from django.views.decorators.vary import vary_on_headers
from django.views.generic.list_detail import object_list

from BeautifulSoup import BeautifulSoup

from parliament.activity.models import Activity
from parliament.activity import utils as activity
from parliament.core.models import Politician, ElectedMember
from parliament.hansards.models import Statement
    
def current_mps(request):
    return object_list(request,
        queryset=ElectedMember.objects.current().order_by('riding__province', 'politician__name_family').select_related('politician', 'riding', 'party'),
        template_name='politicians/electedmember_list.html',
        extra_context={'title': 'Current Members of Parliament'})
        
def former_mps(request):
    former_members = ElectedMember.objects.exclude(end_date__isnull=True)\
        .order_by('riding__province', 'politician__name_family', '-start_date')\
        .select_related('politician', 'riding', 'party')
    seen = set()
    object_list = []
    for member in former_members:
        if member.politician_id not in seen:
            object_list.append(member)
            seen.add(member.politician_id)
    
    c = RequestContext(request, {
        'object_list': object_list,
        'title': 'Former MPs (since 1994)'
    })
    t = loader.get_template("politicians/former_electedmember_list.html")
    return HttpResponse(t.render(c))

@vary_on_headers('X-Requested-With')
def politician(request, pol_id=None, pol_slug=None):
    if pol_slug:
        pol = get_object_or_404(Politician, slug=pol_slug)
    else:
        pol = get_object_or_404(Politician, pk=pol_id)
        if pol.slug:
            return HttpResponsePermanentRedirect(pol.get_absolute_url())
    
    show_statements = bool('page' in request.GET or 
        (pol.latest_member and not pol.latest_member.current))
    
    if show_statements:
        STATEMENTS_PER_PAGE = 10
        statements = pol.statement_set.filter(speaker=False).order_by('-time', '-sequence')
        paginator = Paginator(statements, STATEMENTS_PER_PAGE)
        try:
            pagenum = int(request.GET.get('page', '1'))
        except ValueError:
            pagenum = 1
        try:
            statement_page = paginator.page(pagenum)
        except (EmptyPage, InvalidPage):
            statement_page = paginator.page(paginator.num_pages)
    else:
        statement_page = None
        
    c = RequestContext(request, {
        'pol': pol,
        'member': pol.latest_member,
        'candidacies': pol.candidacy_set.all().order_by('-election__date'),
        'electedmembers': pol.electedmember_set.all().order_by('-start_date'),
        'page': statement_page,
        'statements_politician_view': True,
        'show_statements': show_statements,
        'activities': activity.iter_recent(Activity.public.filter(politician=pol)),
    })
    if request.is_ajax():
        t = loader.get_template("hansards/statement_page_politician_view.inc")
    else:
        t = loader.get_template("politicians/politician.html")
    return HttpResponse(t.render(c))
    
def hide_activity(request):
    if not request.user.is_authenticated() and request.user.is_staff:
        raise PermissionDenied
        
    activity = Activity.objects.get(pk=request.POST['activity_id'])
    activity.active = False
    activity.save()
    return HttpResponse('OK')
    
class PoliticianStatementFeed(Feed):
    
    def get_object(self, request, pol_id):
        return get_object_or_404(Politician, pk=pol_id)
    
    def title(self, pol):
        return "%s in the House of Commons" % pol.name
        
    def link(self, pol):
        return "http://openparliament.ca" + pol.get_absolute_url()
        
    def description(self, pol):
        return "Statements by %s in the House of Commons, from openparliament.ca." % pol.name
        
    def items(self, pol):
        return Statement.objects.filter(member__politician=pol).order_by('-time')[:12]
        
    def item_title(self, statement):
        return statement.topic
        
    def item_link(self, statement):
        return statement.get_absolute_url()
        
    def item_description(self, statement):
        return markdown(statement.text)
        
    def item_pubdate(self, statement):
        return statement.time
        
r_title = re.compile(r'<span class="tag.+?>(.+?)</span>')
r_link = re.compile(r'<a [^>]*?href="(.+?)"')
r_excerpt = re.compile(r'<span class="excerpt">')
class PoliticianActivityFeed(Feed):

    def get_object(self, request, pol_id):
        return get_object_or_404(Politician, pk=pol_id)

    def title(self, pol):
        return pol.name

    def link(self, pol):
        return "http://openparliament.ca" + pol.get_absolute_url()

    def description(self, pol):
        return "Recent news about %s, from openparliament.ca." % pol.name

    def items(self, pol):
        return activity.iter_recent(Activity.objects.filter(politician=pol))

    def item_title(self, activity):
        # FIXME wrap in try
        return r_title.search(activity.payload).group(1)

    def item_link(self, activity):
        match = r_link.search(activity.payload)
        if match:
            return match.group(1)
        else:
            # FIXME include links in activity model?
            return ''
            
    def item_guid(self, activity):
        return activity.guid
    
    def item_description(self, activity):
        payload = r_excerpt.sub('<br><span style="display: block; border-left: 1px dotted #AAAAAA; margin-left: 2em; padding-left: 1em; font-style: italic; margin-top: 5px;">', activity.payload_wrapped())
        payload = r_title.sub('', payload)
        return payload
        
    def item_pubdate(self, activity):
        return datetime.datetime(activity.date.year, activity.date.month, activity.date.day)
import {
    BilingualString,
    BilingualDocument,
} from '../types';

export default class FederalSponsor {

    public id?: number;
    public senateAffiliation?: number;
    public name?: {
        official : {
            given: string,
            family: string,
            middle: string
        },
        usual : {
            given: string
        },
        honorific: BilingualString
    };
    public affiliation?: {
        title: BilingualString,
        role: BilingualDocument,
    };
    public constituency?: BilingualDocument;

    constructor(data:any) {
        if (!(data instanceof Object)) return;
        this.id = data.SponsorPersonId;
        this.senateAffiliation = data.SponsorSenateSystemAffiliationId;
        this.name = {
            official: {
                given: data.SponsorPersonOfficialFirstName,
                family: data.SponsorPersonOfficialLastName,
                middle: data.SponsorPersonMiddleName,
            },
            usual: {
                given: data.SponsorPersonUsualFirstName
            },
            honorific: new BilingualString(data.SponsorPersonShortHonorificEn, data.SponsorPersonShortHonorificFr)
        };
        this.affiliation = {
            title: new BilingualString(data.SponsorAffiliationTitleEn, data.SponsorAffiliationTitleFr),
            role: new BilingualDocument(data.SponsorAffiliationRoleId, data.SponsorAffiliationRoleNameEn, data.SponsorAffiliationRoleNameFr)
        };
        this.constituency = new BilingualDocument(data.SponsorConstituencyId, data.SponsorConstituencyNameEn, data.SponsorConstituencyNameFr);
    }
};
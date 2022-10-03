import {
    BilingualString,
    BilingualDocument,
    TOriginator,
} from '../types';
import FederalBillEvent from './billevent.class';
import FederalSponsor from './federalsponsor.class';

export class FederalBill {

    public id?: number;
    public code?: string;
    public prefix?: string;
    public number?: number;
    public parliament?: number;
    public session?: number;
    public title?: BilingualString;
    public shortTitle?: BilingualString;
    public status?: BilingualDocument;
    public sponsor?: FederalSponsor;
    public senatePreStudy: boolean = false;
    public originator?: TOriginator;
    public governmentBill: boolean = false;
    public houseBill: boolean = false;
    public senateBill: boolean = false;
    public lastSenate?: BilingualDocument;
    public lastChamber?: BilingualDocument;
    public currentStage?: BilingualDocument;
    public completedBillStage?: BilingualDocument;
    public completedBillStageChamber?: BilingualDocument & {datetime?: Date};
    public documentType?: BilingualDocument;
    public chamberOrganization?: BilingualDocument;
    public latestEvent?: FederalBillEvent;
    public readings = {
        house : new Array(),
        senate : new Array()
    };
    public royalAssent?: Date;
    public prevConsidered: boolean = false;
    public prevSession: boolean = false;
    public prevBillId?: number;
    public prevBillCode?: string;
    public nextSession: boolean = false;
    public nextBillId?: number;
    public nextBillCode?: string;
    public passedFirstChamber: boolean[] = [false, false, false];
    public passedSecondChamber: boolean[] = [false, false, false];
    public proForma: boolean = false;
    public form?: BilingualDocument;
    public notes?: BilingualString;
    public shortSummary?: BilingualString;
    public statuteYear?: number;
    public statuteChapter?: number;
    public stages = {
        id : 0,
        house: new Array(),
        senate: new Array(),
        royalAssent: new Array(),
        houseInfo: new Array(),
        senateInfo: new Array(),
        chamberMessages: new Array()
    };
    public publications = new Array();
    public houseVote?: any;
    public houseRuling?: any;
    public senateVote?: any;
    public senateRuling?: any;
    public web?: any;
    public bibliographic?: any;
    public prestudy?: any;
    public similar: Array<any> = new Array();
    public dropped: boolean = false;
    public ongoing: boolean = false;

    constructor(data:any) {
        if (!(data instanceof Object)) return;
        this.id = data.Id;
        this.code = data.NumberCode;
        this.prefix = data.NumberPrefix;
        this.number = data.Number;
        this.parliament = data.ParliamentNumber;
        this.session = data.sessionNumber;
        this.title = new BilingualString(data.LongTitleEn, data.LongTitleFr);
        this.shortTitle = new BilingualString(data.ShortTitleEn, data.ShortTitleFr);
        this.status = new BilingualDocument(data.StatusId, data.StatusNameEn, data.StatusNameFr);
        this.sponsor = new FederalSponsor(data);
        this.senatePreStudy = data.IsInSenatePreStudy;
        this.lastSenate = new BilingualDocument(data.LatestCompletedMajorStageId, data.LatestCompletedMajorStageNameEn, data.LatestCompletedMajorStageNameFr);
        this.lastChamber = new BilingualDocument(data.LatestCompletedMajorStageChamberOrganizationId, data.LatestCompletedMajorStageChamberNameEn, data.LatestCompletedMajorStageChamberNameFr)
        this.currentStage = new BilingualDocument(data.OngoingStageId, data.OngoingStageNameEn, data.OngoingStageNameFr);
        this.completedBillStage = new BilingualDocument(data.LatestCompletedBillStageId, data.LatestCompletedBillStageNameEn, data.LatestCompletedBillStageNameFr)
        this.completedBillStageChamber = new BilingualDocument(data.LatestCompletedBillStageChamberOrganizationId, data.LatestCompletedBillStageChamberNameEn, data.LatestCompletedBillStageChamberNameFr);
        this.completedBillStageChamber.datetime = data.LatestCompletedBillStageDateTime;
        this.documentType = new BilingualDocument(data.BillDocumentTypeId, data.BillDocumentTypeNameEn, data.BillDocumentTypeNameFr);
        this.originator = (data.IsGovernmentBill) ? 'government' : (data.IsHouseBill) ? 'house' : (data.IsSenateBill) ? 'senate' : 'unknown';
        this.governmentBill = data.IsGovernmentBill;
        this.houseBill = data.IsHouseBill;
        this.senateBill = data.IsSenateBill;
        this.chamberOrganization = new BilingualDocument(data.OriginatingChamberOrganizationId, data.OriginatingChamberNameEn, data.OriginatingChamberNameFr);
        this.latestEvent = new FederalBillEvent(data);
        this.prevSession = data.DidReinstateFromPreviousSession;
        this.prevConsidered = data.ConsideredDuringPreviousSitting;
        this.prevBillId = data.ReinstatedFromBillDocumentId;
        this.prevBillCode = data.ReinstatedFromBillNumberCode;
        this.nextSession = data.DidReinstateInNextSession;
        this.nextBillId = data.ReinstatedAsBillDocumentId;
        this.nextBillCode = data.ReinstatedAsBillNumberCode;
        this.passedFirstChamber = [data.PassedFirstChamberFirstReading, data.PassedFirstChamberSecondReading, data.PassedFirstChamberThirdReading];
        this.passedSecondChamber = [data.PassedSecondChamberFirstReading, data.PassedSecondChamberSecondReading, data.PassedSecondChamberThirdReading];
        this.proForma = data.IsProForma;
        this.form = new BilingualDocument(data.BillFormId, data.BillFormNameEn, data.BillFormNameFr)
        this.notes = new BilingualString(data.NotesEn, data.NotesFR);
        this.shortSummary = new BilingualString(data.ShortLegislativeSummaryEn, data.ShortLegislativeSummaryFr);
        this.statuteYear = data.StatuteYear;
        this.statuteChapter = data.StatuteChapter;
        this.publications = data.Publications;
        this.houseVote = data.HouseVoteDetails;
        this.houseRuling = data.HouseRulingAndStatements;
        this.senateVote = data.SenateVoteDetails;
        this.senateRuling = data.SenateRulingAndStatements;
        this.web = data.WebReferences;
        this.bibliographic = data.BibliographicNotices;
        this.senatePreStudy = data.SenatePreStudyCommitteeDetails;
        this.similar = data.SimilarBills;
        this.dropped = data.IsDroppedFromSenateOrderPaper;
        this.ongoing = data.IsSessionOngoing;
        this.stages = {
            id: data.BillStages.BillId,
            house: data.BillStages.HouseBillStages,
            senate: data.BillStages.SenateBillStages,
            royalAssent: data.BillStages.RoyalAssent,
            houseInfo: data.BillStages.HouseAdditionalInformation,
            senateInfo: data.BillStages.SenateAdditionalInformation,
            chamberMessages: data.BillStages.InterChamberMessages
        };

        if (data.PassedHouseFirstReadingDateTime) this.readings.house.push(new Date(data.PassedHouseFirstReadingDateTime));
        if (data.PassedHouseSecondReadingDateTime) this.readings.house.push(new Date(data.PassedHouseSecondReadingDateTime));
        if (data.PassedHouseThirdReadingDateTime) this.readings.house.push(new Date(data.PassedHouseThirdReadingDateTime));
        if (data.PassedSenateFirstReadingDateTime) this.readings.senate.push(new Date(data.PassedSenateFirstReadingDateTime));
        if (data.PassedSenateThirdReadingDateTime) this.readings.senate.push(new Date(data.PassedSenateSecondReadingDateTime));
        if (data.PassedSenateThirdReadingDateTime) this.readings.senate.push(new Date(data.PassedSenateThirdReadingDateTime));
        if (data.ReceivedRoyalAssentDateTime) this.royalAssent = new Date(data.ReceivedRoyalAssentDateTime);
    }

};
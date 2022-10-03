import {
    BilingualString,
    BilingualDocument,
} from '../types';

export default class FederalBillEvent {
    
    public id?: string;
    public name?: BilingualString;
    public stage?: number;
    public type?: string;
    public committee?: any;
    public datetime?: Date;
    public chamber?: BilingualDocument;
    public amendments?: number;
    public amendmentNote?: number;
    public meeting?: number;
    public additionalInfo?: BilingualString;

    constructor(data:any) {
        if (!(data instanceof Object)) return;
        this.id = data.LatestBillEventEventTypeId;
        this.name = new BilingualString(data.LatestBillEventTypeNameEn, data.LatestBillEventTypeNameFr);
        this.stage = data.LatestBillEventStageId;
        this.type = data.LatestBillEventTypeName;
        this.committee = data.LatestBillEventCommitteeDetails;
        this.datetime = new Date(data.LatestBillEventDateTime);
        this.chamber = new BilingualDocument(data.LatestBillEventChamberOrganizationId, data.LatestBillEventChamberNameEn, data.LatestBillEventChamberNameFr);
        this.amendments = data.LatestBillEventNumberOfAmendments;
        this.amendmentNote = data.LatestBillEventAmendmentNoteId;
        this.meeting = data.LatestBillEventMeetingNumber;
        this.additionalInfo = new BilingualString(data.LatestBillEventAdditionalInformationEn, data.LatestBillEventAdditionalInformationFr);
    }
};
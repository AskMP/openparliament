export type TOriginator = 'government'|'house'|'senate'|'unknown';
export class BilingualString {
    constructor(
        public en?:string,
        public fr?:string
    ) {};
};

export class BilingualDocument {

    public name : BilingualString;

    constructor(
        public id?:number,
        en?:string, fr?:string
    ) {
        this.name = new BilingualString(en, fr);
    }
};
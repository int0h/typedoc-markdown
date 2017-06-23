export interface RefRecord {
    meta: any;
    place: string;
}
export interface DocGenCfg {
    cwd: string;
    urlBase: string;
}
export interface DocEntity {
    content: string;
    path: string;
}
export declare class DocGenerator {
    linkTable: {
        [key: string]: RefRecord;
    };
    cwd: string;
    urlBase: string;
    constructor(cfg: DocGenCfg);
    getPath(absPath: string): string;
    getSignatureCode(meta: any): string[];
    signature(meta: any): string;
    params(meta: any): string[];
    args(meta: any): any;
    interface(meta: any): string;
    ref(refData: RefRecord, text: any): string;
    type(meta: any, allowLinks?: boolean): any;
    typeParam(meta: any): string;
    any(meta: any): string;
    genDocs(meta: any): DocEntity[];
}

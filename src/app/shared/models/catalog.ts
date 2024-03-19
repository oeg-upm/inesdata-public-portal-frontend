import { DataService } from "./data-service";

export interface Catalog {
    id?: string;
    "http://www.w3.org/ns/dcat#dataset": Array<any>;
    "http://www.w3.org/ns/dcat#service": DataService;
    "originator": string;
    participantId: string;
}

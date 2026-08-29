import type {
    SearchOwner,
    SearchSort,
} from "../SearchTypes";


export interface ParsedSearchQuery {

    text: string;

    tagNames: string[];

    collectionNames: string[];

    owner: SearchOwner;

    sort: SearchSort;

    hasIncompleteExpression: boolean;

    errors: string[];
}

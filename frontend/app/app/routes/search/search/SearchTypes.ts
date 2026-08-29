export type SearchSort =
    | "popular"
    | "views"
    | "size"
    | "date";


export type SearchOwner =
    | "any"
    | "me";

export interface SearchTag {
    id: string;
    name: string;
}

export interface SearchCollection {
    id: string;
    name: string;
}

export interface SearchQuery {
    text: string;
    tags: SearchTag[];
    collections: SearchCollection[];
    owner: SearchOwner;
    sort: SearchSort;
}

export type SearchQueryStatus =
    | "empty"
    | "incomplete"
    | "valid"
    | "invalid";

export interface SearchValidation {
    status: SearchQueryStatus;
    errors: string[];
}

export type SearchSuggestionType =
    | "tag"
    | "collection"
    | "operator"
    | "sort";

export interface SearchSuggestion {
    type: SearchSuggestionType;
    value: string;
    label: string;
    description?: string;
}

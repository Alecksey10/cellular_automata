import type {
    SearchInputState,
} from "./input/SearchInputState";

import type {
    SearchQuery,
    SearchValidation,
} from "./SearchTypes";


export type SearchStatus =
    | "idle"
    | "processing"
    | "ready"
    | "error";


export interface SearchState {

    input: SearchInputState;

    query: SearchQuery | null;

    validation:
        SearchValidation | null;

    status: SearchStatus;

    error: Error | null;
}

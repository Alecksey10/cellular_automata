import type {
    SearchQuery,
    SearchSuggestion,
    SearchValidation,
} from "../SearchTypes";

import type {
    SearchInputState,
} from "./SearchInputState";


export type SearchInputListener = (
    state: SearchInputState,
) => void;


export type SearchSubmitResult =
    | {
        success: true;
        query: SearchQuery;
    }
    | {
        success: false;
        validation: SearchValidation;
    };


export interface SearchInputEngine {

    getInputState(): SearchInputState;


    setInput(
        value: string,
    ): Promise<void>;


    focusInput(): void;


    blurInput(): void;


    handleEscape(): void;


    selectSuggestion(
        suggestion: SearchSuggestion,
    ): Promise<void>;


    submit(): Promise<SearchSubmitResult>;


    subscribeInput(
        listener: SearchInputListener,
    ): () => void;
}

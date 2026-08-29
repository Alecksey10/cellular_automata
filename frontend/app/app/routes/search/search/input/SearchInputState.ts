import type {
    SearchSuggestion,
    SearchValidation,
} from "../SearchTypes";

export interface SearchInputState {
    value: string;

    suggestions: SearchSuggestion[];

    suggestionsVisible: boolean;

    focused: boolean;

    validation: SearchValidation | null;
}

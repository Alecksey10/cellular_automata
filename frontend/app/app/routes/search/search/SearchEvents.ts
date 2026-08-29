import type {
    SearchState,
} from "./SearchState";


export type SearchEvent =
    | {
        type: "stateChanged";

        state: SearchState;
    };


export type SearchEventListener =
    (event: SearchEvent) => void;

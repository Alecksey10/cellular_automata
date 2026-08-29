import {
    useEffect,
    useState,
} from "react";

import type {
    SearchInputEngine,
} from "../search/input/SearchInputEngine";

import type {
    SearchInputState,
} from "../search/input/SearchInputState";

import type {
    SearchQuery,
    SearchSuggestion,
    SearchValidation,
} from "../search/SearchTypes";
import { AutomatonCard } from "./AutomatonCard";


export interface SearchInputProps {

    engine: SearchInputEngine;

    placeholder?: string;


    onChange?: (
        value: string,
    ) => void;


    onValidationChange?: (
        validation: SearchValidation | null,
    ) => void;


    onSubmit?: (
        query: SearchQuery,
    ) => void;


    onFocus?: () => void;


    onBlur?: () => void;


    onEscape?: () => void;
}


export function SearchInput({
    engine,

    placeholder = "Search automata...",

    onChange,

    onValidationChange,

    onSubmit,

    onFocus,

    onBlur,

    onEscape,
}: SearchInputProps) {

    const [state, setState] =
        useState<SearchInputState>(
            engine.getInputState(),
        );


    useEffect(() => {

        return engine.subscribeInput(
            nextState => {

                setState(nextState);

                onValidationChange?.(
                    nextState.validation,
                );
            },
        );

    }, [
        engine,
        onValidationChange,
    ]);


    const handleSubmit =
        async () => {

            const result =
                await engine.submit();


            if (!result.success) {

                onValidationChange?.(
                    result.validation,
                );

                return;
            }


            onSubmit?.(
                result.query,
            );
        };


    return (
        <div
            style={{
                position: "relative",
                width: "100%",
            }}
        >

            <input
                type="text"

                value={
                    state.value
                }

                placeholder={
                    placeholder
                }

                autoComplete="off"

                onFocus={() => {

                    engine.focusInput();

                    onFocus?.();
                }}


                onBlur={() => {

                    /*
                     * Позволяем click по suggestion
                     * пройти до обработки blur.
                     */
                    setTimeout(() => {

                        engine.blurInput();

                        onBlur?.();

                    }, 0);
                }}


                onChange={event => {

                    const value =
                        event.target.value;


                    void engine.setInput(
                        value,
                    );


                    onChange?.(
                        value,
                    );
                }}


                onKeyDown={event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        void handleSubmit();

                        return;
                    }


                    if (
                        event.key === "Escape"
                    ) {

                        event.preventDefault();

                        engine.handleEscape();

                        onEscape?.();
                    }
                }}


                style={{
                    width: "100%",

                    boxSizing:
                        "border-box",

                    padding:
                        "14px 16px",

                    fontSize: 18,

                    border:
                        "1px solid #ccc",

                    borderRadius: 8,

                    outline: "none",
                }}
            />


            {state.validation?.status ===
                "invalid" && (

                <div
                    style={{
                        marginTop: 6,

                        color: "#d32f2f",

                        fontSize: 14,
                    }}
                >

                    {state.validation.errors.map(
                        (error, index) => (

                            <div key={index}>
                                {error}
                            </div>

                        ),
                    )}

                </div>
            )}


            {state.validation?.status ===
                "incomplete" && (

                <div
                    style={{
                        marginTop: 6,

                        color: "#888",

                        fontSize: 14,
                    }}
                >
                    Continue entering the query...
                </div>
            )}


            {state.suggestionsVisible && (

                <Suggestions
                    suggestions={
                        state.suggestions
                    }

                    onSelect={
                        suggestion =>
                            void engine
                                .selectSuggestion(
                                    suggestion,
                                )
                    }
                />
            )}

        </div>
    );
}


interface SuggestionsProps {

    suggestions:
        SearchSuggestion[];

    onSelect: (
        suggestion: SearchSuggestion,
    ) => void;
}


function Suggestions({
    suggestions,
    onSelect,
}: SuggestionsProps) {

    if (suggestions.length === 0) {
        return null;
    }


    return (
        <div
            style={{
                position: "absolute",

                left: 0,
                right: 0,

                top:
                    "calc(100% + 4px)",

                background: "white",

                border:
                    "1px solid #ddd",

                borderRadius: 8,

                boxShadow:
                    "0 4px 15px rgba(0,0,0,.08)",

                overflow: "hidden",

                zIndex: 100,
            }}
        >

            {suggestions.map(
                suggestion => (

                    <button
                        key={
                            `${suggestion.type}:${suggestion.value}`
                        }

                        type="button"

                        onMouseDown={event => {

                            /*
                             * Не даём input потерять
                             * focus перед click.
                             */
                            event.preventDefault();
                        }}

                        onClick={() => {

                            onSelect(
                                suggestion,
                            );
                        }}

                        style={{
                            display:
                                "block",

                            width: "100%",

                            padding:
                                "10px 14px",

                            border: 0,

                            background:
                                "transparent",

                            textAlign:
                                "left",

                            cursor:
                                "pointer",
                        }}
                    >

                        <div>
                            {
                                suggestion.label
                            }
                        </div>


                        {suggestion.description && (

                            <small
                                style={{
                                    color:
                                        "#888",
                                }}
                            >
                                {
                                    suggestion.description
                                }
                            </small>
                        )}

                    </button>
                ),
            )}

        
        </div>

);
}

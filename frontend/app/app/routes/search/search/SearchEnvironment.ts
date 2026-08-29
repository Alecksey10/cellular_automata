import type {
    SearchQuery,
    SearchSuggestion,
    SearchValidation,
} from "./SearchTypes";

import type {
    SearchDataProvider,
} from "./data/SearchDataProvider";

import {
    SearchCompletion,
} from "./completion/SearchCompletion";

import {
    SearchParser,
} from "./parser/SearchParser";

import {
    SearchQueryBuilder,
} from "./query/SearchQueryBuilder";

import {
    SearchValidator,
} from "./validation/SearchValidator";

import type {
    SearchInputEngine,
    SearchInputListener,
    SearchSubmitResult,
} from "./input/SearchInputEngine";

import type {
    SearchInputState,
} from "./input/SearchInputState";

export interface SearchEnvironmentOptions {
    initialValue?: string;
}

export class SearchEnvironment
    implements SearchInputEngine {

    private readonly initialValue: string;
    private readonly initializationPromise: Promise<void>;

    private readonly parser =
        new SearchParser();


    private readonly completion:
        SearchCompletion;


    private readonly validator =
        new SearchValidator();


    private readonly queryBuilder:
        SearchQueryBuilder;


    private state: SearchInputState = {

        value: "",

        suggestions: [],

        suggestionsVisible: false,

        focused: false,

        validation: null,
    };


    private readonly listeners =
        new Set<SearchInputListener>();


    private operationId = 0;


    constructor(
        dataProvider: SearchDataProvider,
        options: SearchEnvironmentOptions = {},
    ) {
        this.completion =
            new SearchCompletion(dataProvider);

        this.queryBuilder =
            new SearchQueryBuilder(dataProvider);

        this.initialValue =
            options.initialValue ?? "";

        this.initializationPromise =
            this.initialize();
    }


    async initialize(): Promise<void> {

        if (!this.initialValue) {
            return;
        }

        await this.setInput(
            this.initialValue,
        );
    }


    async ready(): Promise<void> {
        await this.initializationPromise;
    }



    getInputState():
        SearchInputState {

        return this.state;
    }


    async setInput(
        value: string,
    ): Promise<void> {
        console.log(value)
        const operationId =
            ++this.operationId;


        this.updateState({

            value,

            validation: null,

            suggestionsVisible:
                this.state.focused,
        });


        const parsed =
            this.parser.parse(value);


        /*
         * Синтаксическая ошибка.
         *
         * Например:
         *
         * taa:12
         */
        if (parsed.errors.length > 0) {

            const validation: SearchValidation = {

                status: "invalid",

                errors: parsed.errors,
            };


            this.updateState({

                validation,

                suggestions: [],

                suggestionsVisible: false,
            });


            return;
        }


        /*
         * Пока пользователь вводит:
         *
         * tag:
         *
         * это incomplete.
         *
         * QueryBuilder здесь нам не нужен.
         */
        if (
            parsed.hasIncompleteExpression
        ) {

            const validation:
                SearchValidation = {

                status: "incomplete",

                errors: [],
            };


            const suggestions =
                await this.completion.complete(
                    value,
                );


            if (
                operationId !==
                this.operationId
            ) {
                return;
            }


            this.updateState({

                validation,

                suggestions,

                suggestionsVisible:
                    this.state.focused &&
                    suggestions.length > 0,
            });


            return;
        }


        /*
         * Строим полноценный query.
         */
        try {

            const query =
                await this.queryBuilder
                    .build(parsed);


            if (
                operationId !==
                this.operationId
            ) {
                return;
            }


            const validation =
                this.validator.validate(
                    query,

                    false,

                    [],
                );


            const suggestions =
                await this.completion.complete(
                    value,
                );


            if (
                operationId !==
                this.operationId
            ) {
                return;
            }


            this.updateState({

                validation,

                suggestions,

                suggestionsVisible:
                    this.state.focused &&
                    suggestions.length > 0,
            });

        } catch (error) {

            if (
                operationId !==
                this.operationId
            ) {
                return;
            }


            const message =
                error instanceof Error
                    ? error.message
                    : String(error);


            this.updateState({

                validation: {

                    status: "invalid",

                    errors: [
                        message,
                    ],
                },

                suggestions: [],

                suggestionsVisible: false,
            });
        }
    }


    focusInput(): void {

        this.updateState({

            focused: true,

            suggestionsVisible:
                this.state.suggestions
                    .length > 0,
        });
    }


    blurInput(): void {

        this.updateState({

            focused: false,

            suggestionsVisible: false,
        });
    }


    handleEscape(): void {

        this.updateState({

            suggestionsVisible: false,
        });
    }


    async selectSuggestion(
        suggestion: SearchSuggestion,
    ): Promise<void> {

        const input =
            this.state.value;


        const hasTrailingSpace =
            /\s$/.test(input);


        let newInput: string;


        if (hasTrailingSpace) {

            newInput =
                input +
                suggestion.value +
                " ";

        } else {

            const parts =
                input.split(/\s+/);


            parts.pop();


            parts.push(
                suggestion.value,
            );


            newInput =
                parts.join(" ") +
                " ";
        }


        await this.setInput(
            newInput,
        );


        /*
         * setInput мог получить новый список
         * suggestions. Оставляем строку открытой.
         */
        this.updateState({

            focused: true,

            suggestionsVisible:
                this.state.focused &&
                this.state.suggestions.length > 0,
        });
    }


    async submit():
        Promise<SearchSubmitResult> {

        const parsed =
            this.parser.parse(
                this.state.value,
            );


        /*
         * Ошибка parser.
         */
        if (parsed.errors.length > 0) {

            const validation:
                SearchValidation = {

                status: "invalid",

                errors: parsed.errors,
            };


            this.updateState({
                validation,
            });


            return {
                success: false,
                validation,
            };
        }


        /*
         * Нельзя отправить incomplete.
         */
        if (
            parsed.hasIncompleteExpression
        ) {

            const validation:
                SearchValidation = {

                status: "incomplete",

                errors: [],
            };


            this.updateState({
                validation,
            });


            return {
                success: false,
                validation,
            };
        }


        try {

            const query =
                await this.queryBuilder
                    .build(parsed);


            const validation =
                this.validator.validate(
                    query,
                    false,
                    [],
                );


            this.updateState({
                validation,
            });


            if (
                validation.status !== "valid"
            ) {

                return {
                    success: false,
                    validation,
                };
            }


            /*
             * Это единственное место,
             * где query считается применённым.
             */
            return {
                success: true,
                query,
            };

        } catch (error) {

            const validation:
                SearchValidation = {

                status: "invalid",

                errors: [

                    error instanceof Error
                        ? error.message
                        : String(error),
                ],
            };


            this.updateState({
                validation,
            });


            return {
                success: false,
                validation,
            };
        }
    }


    subscribeInput(
        listener: SearchInputListener,
    ): () => void {

        this.listeners.add(listener);


        return () => {

            this.listeners.delete(
                listener,
            );
        };
    }


    private updateState(
        patch: Partial<SearchInputState>,
    ): void {

        this.state = {

            ...this.state,

            ...patch,
        };


        this.emit();
    }


    private emit(): void {

        for (
            const listener
            of this.listeners
        ) {

            listener(this.state);
        }
    }
}

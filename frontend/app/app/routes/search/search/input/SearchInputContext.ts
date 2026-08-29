export type SearchInputContextType =
    | "empty"
    | "text"
    | "tag"
    | "collection"
    | "owner"
    | "sort"
    | "unknown";


export interface SearchInputContext {
    type: SearchInputContextType;

    currentToken: string;

    value: string;

    prefix: string;

    hasTrailingSpace: boolean;
}


export class SearchInputContextParser {

    parse(input: string): SearchInputContext {

        const hasTrailingSpace =
            /\s$/.test(input);


        /*
         * Если строка заканчивается пробелом,
         * текущего token ещё нет.
         */
        if (hasTrailingSpace) {

            return {
                type: "empty",

                currentToken: "",

                value: "",

                prefix: "",

                hasTrailingSpace: true,
            };
        }


        const currentToken =
            input
                .split(/\s+/)
                .pop() ?? "";


        if (currentToken === "") {

            return {
                type: "empty",

                currentToken: "",

                value: "",

                prefix: "",

                hasTrailingSpace,
            };
        }


        if (currentToken.startsWith("tag:")) {

            return {
                type: "tag",

                currentToken,

                value:
                    currentToken.slice(4),

                prefix: "tag:",

                hasTrailingSpace,
            };
        }


        if (
            currentToken.startsWith(
                "collection:",
            )
        ) {

            return {
                type: "collection",

                currentToken,

                value:
                    currentToken.slice(
                        "collection:".length,
                    ),

                prefix: "collection:",

                hasTrailingSpace,
            };
        }


        if (currentToken.startsWith("owner:")) {

            return {
                type: "owner",

                currentToken,

                value:
                    currentToken.slice(
                        "owner:".length,
                    ),

                prefix: "owner:",

                hasTrailingSpace,
            };
        }


        if (currentToken.startsWith("sort:")) {

            return {
                type: "sort",

                currentToken,

                value:
                    currentToken.slice(
                        "sort:".length,
                    ),

                prefix: "sort:",

                hasTrailingSpace,
            };
        }


        /*
         * Если token похож на оператор,
         * но оператор неизвестен.
         */
        if (currentToken.includes(":")) {

            return {
                type: "unknown",

                currentToken,

                value: currentToken,

                prefix: "",

                hasTrailingSpace,
            };
        }


        return {
            type: "text",

            currentToken,

            value: currentToken,

            prefix: "",

            hasTrailingSpace,
        };
    }
}

import type {
    SearchOwner,
    SearchSort,
} from "../SearchTypes";

import type {
    ParsedSearchQuery,
} from "./SearchQuery";


export class SearchParser {

    parse(
        input: string,
    ): ParsedSearchQuery {

        const tokens = input
            .trim()
            .split(/\s+/)
            .filter(Boolean);


        const text: string[] = [];

        const tagNames: string[] = [];

        const collectionNames: string[] = [];

        const errors: string[] = [];


        let owner: SearchOwner = "any";

        let sort: SearchSort = "popular";

        let hasIncompleteExpression = false;


        for (const token of tokens) {

            /*
             * tag:
             */

            if (token === "tag:") {

                hasIncompleteExpression = true;

                continue;
            }

            
            if (token.startsWith("tag:")) {
                const value =
                    token.slice("tag:".length);
                if (value.length > 0) {
                    tagNames.push(value);
                }
                continue;
            }


            /*
             * collection:
             */

            if (token === "collection:") {

                hasIncompleteExpression = true;

                continue;
            }


            if (
                token.startsWith(
                    "collection:",
                )
            ) {

                const value =
                    token.slice(
                        "collection:".length,
                    );


                if (value.length > 0) {
                    collectionNames.push(value);
                }

                continue;
            }


            /*
             * owner:
             */

            if (token === "owner:") {

                hasIncompleteExpression = true;

                continue;
            }


            if (token.startsWith("owner:")) {

                const value =
                    token.slice("owner:".length);


                if (value === "me") {

                    owner = "me";

                } else {

                    errors.push(
                        `Unknown owner: "${value}"`,
                    );
                }

                continue;
            }


            /*
             * sort:
             */

            if (token === "sort:") {

                hasIncompleteExpression = true;

                continue;
            }


            if (token.startsWith("sort:")) {

                const value =
                    token.slice("sort:".length);


                if (
                    value === "popular" ||
                    value === "views" ||
                    value === "size" ||
                    value === "date"
                ) {

                    sort = value;

                } else {

                    errors.push(
                        `Unknown sort: "${value}"`,
                    );
                }

                continue;
            }


            /*
             * Любой неизвестный оператор.
             *
             * Например:
             *
             * taa:12
             * foo:bar
             */

            if (token.includes(":")) {

                const separator =
                    token.indexOf(":");


                const operator =
                    token.slice(
                        0,
                        separator,
                    );


                errors.push(
                    `Unknown search operator: "${operator}"`,
                );

                continue;
            }


            text.push(token);
        }


        return {

            text: text.join(" "),

            tagNames,

            collectionNames,

            owner,

            sort,

            hasIncompleteExpression,

            errors,
        };
    }
}

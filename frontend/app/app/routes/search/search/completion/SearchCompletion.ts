import type {
    SearchSuggestion,
} from "../SearchTypes";

import type {
    SearchDataProvider,
} from "../data/SearchDataProvider";


export class SearchCompletion {

    constructor(
        private readonly data:
            SearchDataProvider,
    ) {}


    async complete(
        input: string,
    ): Promise<SearchSuggestion[]> {

        if (/\s$/.test(input)) {
            return this.operatorSuggestions();
        }


        const currentToken =
            input
                .split(/\s+/)
                .pop() ?? "";


        if (currentToken === "") {
            return this.operatorSuggestions();
        }


        if (currentToken.startsWith("tag:")) {

            return this.completeTags(
                currentToken.slice(4),
            );
        }


        if (
            currentToken.startsWith(
                "collection:",
            )
        ) {

            return this.completeCollections(
                currentToken.slice(
                    "collection:".length,
                ),
            );
        }


        if (currentToken.startsWith("sort:")) {

            return this.completeSort(
                currentToken.slice(5),
            );
        }


        if (currentToken.startsWith("owner:")) {

            return this.completeOwner(
                currentToken.slice(6),
            );
        }


        if (currentToken.includes(":")) {
            return [];
        }


        return this.operatorSuggestions();
    }


    private async completeTags(
        value: string,
    ): Promise<SearchSuggestion[]> {

        const tags =
            await this.data.searchTags(value);


        return tags.map(tag => ({

            type: "tag",

            value: `tag:${tag.name}`,

            label: tag.name,

            description: "Tag",
        }));
    }


    private async completeCollections(
        value: string,
    ): Promise<SearchSuggestion[]> {

        const collections =
            await this.data
                .searchCollections(value);


        return collections.map(
            collection => ({

                type: "collection",

                value:
                    `collection:${collection.name}`,

                label: collection.name,

                description: "Collection",
            }),
        );
    }


    private completeSort(
        value: string,
    ): SearchSuggestion[] {

        return [
            "popular",
            "views",
            "size",
            "date"
        ]
            .filter(
                sort =>
                    sort.startsWith(value),
            )
            .map(sort => ({

                type: "sort" as const,

                value: `sort:${sort}`,

                label: sort,

                description: "Sort",
            }));
    }


    private completeOwner(
        value: string,
    ): SearchSuggestion[] {

        if ("me".startsWith(value)) {

            return [{
                type: "operator",

                value: "owner:me",

                label: "me",

                description:
                    "Automata owned by you",
            }];
        }


        return [];
    }


    private operatorSuggestions():
        SearchSuggestion[] {

        return [

            {
                type: "operator",

                value: "tag:",

                label: "tag:",

                description:
                    "Search by tag",
            },

            {
                type: "operator",

                value: "collection:",

                label: "collection:",

                description:
                    "Search by collection",
            },

            {
                type: "operator",

                value: "owner:me",

                label: "owner:me",

                description:
                    "Automata owned by you",
            },

            {
                type: "operator",

                value: "sort:",

                label: "sort:",

                description:
                    "Change sorting",
            },
        ];
    }
}

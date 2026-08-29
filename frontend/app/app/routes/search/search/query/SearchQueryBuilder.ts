import type {
    SearchQuery,
} from "../SearchTypes";

import type {
    SearchDataProvider,
} from "../data/SearchDataProvider";

import type {
    ParsedSearchQuery,
} from "../parser/SearchQuery";


export class SearchQueryBuilder {

    constructor(
        private readonly data:
            SearchDataProvider,
    ) {}


    async build(
        parsed: ParsedSearchQuery,
    ): Promise<SearchQuery> {

        const tags = [];


        for (
            const name
            of parsed.tagNames
        ) {

            const tag =
                await this.data.getTagByName(
                    name,
                );


            if (!tag) {

                throw new Error(
                    `Tag "${name}" does not exist.`,
                );
            }


            tags.push(tag);
        }


        const collections = [];


        for (
            const name
            of parsed.collectionNames
        ) {

            const collection =
                await this.data
                    .getCollectionByName(name);


            if (!collection) {

                throw new Error(
                    `Collection "${name}" does not exist.`,
                );
            }


            collections.push(collection);
        }


        return {

            text: parsed.text,

            tags,

            collections,

            owner: parsed.owner,

            sort: parsed.sort,
        };
    }
}

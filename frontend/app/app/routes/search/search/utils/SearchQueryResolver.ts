import type {
    SearchCollection,
    SearchOwner,
    SearchQuery,
    SearchSort,
    SearchTag,
} from "../SearchTypes";

import type { ParsedSearchQuery } from "../parser/SearchQuery";

export interface SearchQueryResolverSource {
    findTagByName(name: string): SearchTag | undefined;

    findCollectionByName(
        name: string,
    ): SearchCollection | undefined;
}

export class SearchQueryResolver {
    constructor(
        private readonly source: SearchQueryResolverSource,
    ) {}

    resolve(
        parsed: ParsedSearchQuery,
    ): SearchQuery {
        const tags = parsed.tagNames
            .map((name) =>
                this.source.findTagByName(name),
            )
            .filter(
                (tag): tag is SearchTag =>
                    tag !== undefined,
            );

        const collections =
            parsed.collectionNames
                .map((name) =>
                    this.source.findCollectionByName(
                        name,
                    ),
                )
                .filter(
                    (
                        collection,
                    ): collection is SearchCollection =>
                        collection !== undefined,
                );

        return {
            text: parsed.text,
            tags,
            collections,
            owner: parsed.owner,
            sort: parsed.sort,
        };
    }
}
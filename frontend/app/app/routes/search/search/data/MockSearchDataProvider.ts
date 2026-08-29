import type {
    SearchCollection,
    SearchTag,
} from "../SearchTypes";

import type {
    SearchDataProvider,
} from "./SearchDataProvider";


export class MockSearchDataProvider
    implements SearchDataProvider {

    private readonly tags: SearchTag[] = [

        {
            id: "1",
            name: "game",
        },

        {
            id: "2",
            name: "game-of-life",
        },

        {
            id: "3",
            name: "physics",
        },

        {
            id: "4",
            name: "simulation",
        },

        {
            id: "5",
            name: "cellular-automata",
        },

        {
            id: "6",
            name: "math",
        },
    ];


    private readonly collections:
        SearchCollection[] = [

        {
            id: "1",
            name: "popular",
        },

        {
            id: "2",
            name: "featured",
        },

        {
            id: "3",
            name: "my-favorites",
        },
    ];


    async searchTags(
        query: string,
    ): Promise<SearchTag[]> {

        const normalized =
            query.toLowerCase();


        return this.tags.filter(tag =>
            tag.name
                .toLowerCase()
                .startsWith(normalized),
        );
    }


    async searchCollections(
        query: string,
    ): Promise<SearchCollection[]> {

        const normalized =
            query.toLowerCase();


        return this.collections.filter(
            collection =>
                collection.name
                    .toLowerCase()
                    .startsWith(normalized),
        );
    }


    async getTagByName(
        name: string,
    ): Promise<SearchTag | null> {

        return (
            this.tags.find(
                tag =>
                    tag.name === name,
            ) ?? null
        );
    }


    async getCollectionByName(
        name: string,
    ): Promise<SearchCollection | null> {

        return (
            this.collections.find(
                collection =>
                    collection.name === name,
            ) ?? null
        );
    }
}

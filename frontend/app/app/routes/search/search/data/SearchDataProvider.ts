import type {
    SearchCollection,
    SearchTag,
} from "../SearchTypes";


export interface SearchDataProvider {

    searchTags(
        query: string,
    ): Promise<SearchTag[]>;


    searchCollections(
        query: string,
    ): Promise<SearchCollection[]>;


    getTagByName(
        name: string,
    ): Promise<SearchTag | null>;


    getCollectionByName(
        name: string,
    ): Promise<SearchCollection | null>;
}

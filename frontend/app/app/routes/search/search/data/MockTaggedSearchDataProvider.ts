import type { TypeLiteralNode } from "typescript";
import type {
    SearchCollection,
    SearchTag,
} from "../SearchTypes";

import type {
    SearchDataProvider,
} from "./SearchDataProvider";
import type { initialize } from "esbuild";
import { tagsAPI } from "../../../../../api/tags";


export class MockSearchDataProvider
    implements SearchDataProvider {

    private tags: SearchTag[] = [];


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
        console.log("query -", query, this.tags)

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

    getTags()
    {
        return this.tags;
    }
    setTags(tags:SearchTag[])
    {
        this.tags = [...tags]
    }
}


export abstract class SingleTon<Type>
{
    abstract __instance:Type | null;
    abstract getInstance():Type;
    abstract initialize():void;
}

export let provider = {
    __instance:null,
    getInstance():MockSearchDataProvider
    {
        if(this.__instance===null){
            this.__instance = new MockSearchDataProvider()
        }   
        return this.__instance as MockSearchDataProvider
    },
    async initialize()
    {
        if(this.getInstance().getTags().length!=0)
        {
            return;
        }
        let response = await tagsAPI.getTags.execute();
        let tagsToSet = (response).data!.map(tag=>{
                return ({id:tag.id, name:tag.name} as SearchTag)})

        this.getInstance().setTags(tagsToSet)   
    }
} as SingleTon<MockSearchDataProvider>

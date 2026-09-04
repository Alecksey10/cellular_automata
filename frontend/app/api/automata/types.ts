import type { Tag } from "../tags/types";

export interface AutomatonCard {
    id: string;
    name: string;
    slug: string;
    description: string | null;

    owner?: {
        id: string;
        username: string;
    };

    tags?: Tag[];
}

export interface AutomatonSourceCode {
    source_code: string;
}

export interface UserShortResponse
{    id: number
    username: string}

export interface TagShortResponse {
    id: string
    name: string
}

export interface AutomatonGetResponse {
    id: string;

    name: string;
    slug: string | null;
    description: string | null;

    source_line_count: number;
    source_size: number;

    owner: UserShortResponse | null;

    tags: TagShortResponse[];

    based_on_id: string | null;

    created_at: string;
    updated_at: string;
}



export interface AutomatonCreateResponse {
    id: number

    name: string
    slug: string | null
    description: string | null

    source_line_count: number
    source_size: number

    owner: UserShortResponse | null

    tags: TagShortResponse[]

    based_on_id: number | null

    created_at: string
    updated_at: string
}

export interface AutomatonCreateRequest{
    name: string
    slug: string | null
    description: string | null

    source_code: string

    based_on_id: number | null

    tag_ids: string[]
}

export type SearchSort =
    | "popular"
    | "views"
    | "size"
    | "date";


export type SearchOwner =
    | "any"
    | "me";


export interface AutomatonSearchRequest {
    text?: string;
    tags?: string[];
    collections?: string[];

    owner?: SearchOwner;
    sort?: SearchSort;

    page?: number;
}


export interface AutomatonSearchResponse {
    total: number;
    page: number;
    page_size: number;

    items: AutomatonCard[];
}

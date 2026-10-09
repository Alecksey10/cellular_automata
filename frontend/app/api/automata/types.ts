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
    preview_image: string|null
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
    image: string|null
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
    image: string|null

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

export interface AutomatonUpdateImageRequest{
    automataID: string
    data:File|null
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
    uri:string
}
// export interface AutomatonSearchRequest {
//     text?: string;
//     tags?: string[];
//     collections?: string[];

//     owner?: SearchOwner;
//     sort?: SearchSort;

//     page?: number;
// }


export interface AutomatonSearchResponse {
    total: number;
    page: number;
    page_size: number;

    items: AutomatonCard[];
}


export interface AutomatonsGetImagesRequest{
    images_ids: string[]
}

export interface AutomatonsGetImagesResponse{
    automatas_data:{
        id: string,
        image_url:string}[]
}


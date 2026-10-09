import type { AutomatonSearchRequest } from "./types";
// import { requestAutomatonSearchToUri } from "./utils";


export const AUTOMATA_ENDPOINTS = {
    list: "/automata",

    automata_by_id: (automata_id: string) =>
        `/automata/${automata_id}`,

    automata_source: (automata_id: string) =>
        `/automata/${automata_id}/source`,

    automata_create: () =>
        "/automata/create",

    automata_update: (automata_id: string) =>
        `/automata/${automata_id}`,

    automatas_get_images:(images_ids:string[])=>
    {
        let ids = ""
        if(images_ids.length)
            {
                ids = images_ids.reduce((cur, next_val, cur_index)=>{return cur+next_val.toString()+(cur_index<images_ids.length-1?"&ids=":"")}, "?ids=")
            }
        return `/automata/images/${ids}`
    },

    automata_update_image: (automata_id: string) =>
        `/automata/image/${automata_id}`,

    automata_search: (request: AutomatonSearchRequest) => {
        return `/automata/search_by_tags/?`+request.uri;
    },

} as const;

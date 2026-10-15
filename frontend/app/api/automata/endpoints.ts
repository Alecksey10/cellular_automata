import type { AutomatonSearchRequest } from "./types";


export const AUTOMATA_ENDPOINTS = {
    list: "/automata",

    automata_by_id: (automata_id: string) =>
        `/automata/${automata_id}`,

    automata_source: (automata_id: string) =>
        `/automata/${automata_id}/source`,

    automata_create: () =>
        "/automata",

    automata_update: (automata_id: string) =>
        `/automata/${automata_id}`,

    automata_update_image: (automata_id: string) =>
        `/automata/${automata_id}/image`,

    automatas_get_images: (images_ids: string[]) => {
        const query = new URLSearchParams();

        for (const image_id of images_ids) {
            query.append("ids", image_id);
        }

        const queryString = query.toString();

        return queryString
            ? `/automata/images?${queryString}`
            : "/automata/images";
    },

    automata_search: (request: AutomatonSearchRequest) =>
        `/automata/search_by_tags?${request.uri}`,

} as const;

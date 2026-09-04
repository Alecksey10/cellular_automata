import type { AutomatonSearchRequest } from "./types";


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

    automata_search: (request: AutomatonSearchRequest) => {
        const params = new URLSearchParams();

        if (request.text) {
            params.set(
                "text",
                request.text,
            );
        }

        for (const tag of request.tags ?? []) {
            params.append(
                "tags",
                tag,
            );
        }

        for (const collection of request.collections ?? []) {
            params.append(
                "collections",
                collection,
            );
        }

        if (request.owner) {
            params.set(
                "owner",
                request.owner,
            );
        }

        if (request.sort) {
            params.set(
                "sort",
                request.sort,
            );
        }

        if (request.page !== undefined) {
            params.set(
                "page",
                request.page.toString(),
            );
        }

        return `/automata/search_by_tags?${params.toString()}`;
    },

} as const;

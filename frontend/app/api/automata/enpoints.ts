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

} as const;

export const AUTOMATA_ENDPOINTS = {
    list: "/automata",

    automata: (automata_id:string)=>`/automata/${automata_id}/source`,
} as const;
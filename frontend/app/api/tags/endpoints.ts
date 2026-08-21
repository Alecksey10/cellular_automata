export const TAG_ENDPOINTS = {
    list: "/tags",

    automata:
        (tagId: string) =>
            `/tags/${tagId}/automata`,
} as const;
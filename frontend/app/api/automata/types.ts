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
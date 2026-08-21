import {
    APIMethodGetTags,
} from "./APIMethodGetTags";

import {
    APIMethodGetAutomataByTag,
} from "./APIMethodGetAutomataByTag";


export const tagsAPI = {
    getTags:
        new APIMethodGetTags(),

    getAutomataByTag:
        new APIMethodGetAutomataByTag(),
};
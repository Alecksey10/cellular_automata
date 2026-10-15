import { APIMethodCreateAutomata } from "./APIMethodCreateAutomata";
import { APIMethodGetAutomataByID } from "./APIMethodGetAutomataByID";
import { APIMethodGetAutomataSourceByID } from "./APIMethodGetAutomataByID";
import { APIMethodGetAutomatasImages } from "./APIMethodGetAutomatasImages";
import { APIMethodSearchAutomatas } from "./APIMethodSearchAutomatas";
import { APIMethodUpdateAutomata } from "./APIMethodUpdateAutomata";
import { APIMethodUpdateAutomataImage } from "./APIMethodUpdateAutomataImage";


export const automataAPI = {
    getAutomata:
        new APIMethodGetAutomataByID(),

    getAutomataSource:
        new APIMethodGetAutomataSourceByID(),
    getAutomatasImages:
        new APIMethodGetAutomatasImages(),

    createAutomata:
        new APIMethodCreateAutomata(),

    updateAutomata:
        new APIMethodUpdateAutomata(),
    updateAutomataImage:
        new APIMethodUpdateAutomataImage(),

    searchAutomata:
        new APIMethodSearchAutomatas(),
};

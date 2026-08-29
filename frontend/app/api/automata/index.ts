import { APIMethodCreateAutomata } from "./APIMethodCreateAutomata";
import { APIMethodGetAutomataByID } from "./APIMethodGetAutomataByID";
import { APIMethodGetAutomataSourceByID } from "./APIMethodGetAutomataByID";
import { APIMethodUpdateAutomata } from "./APIMethodUpdateAutomata";


export const automataAPI = {
    getAutomata:
        new APIMethodGetAutomataByID(),

    getAutomataSource:
        new APIMethodGetAutomataSourceByID(),

    createAutomata:
        new APIMethodCreateAutomata(),

    updateAutomata:
        new APIMethodUpdateAutomata(),
};

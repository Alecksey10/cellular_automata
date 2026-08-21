import {
    APIMethodBase,
} from "../APIMethodBase";

import {
    APIMethodDataResponse,
} from "../APIMethodDataResponse";

import type {
    AutomatonCard,
} from "../automata/types";

import {
    TAG_ENDPOINTS,
} from "./endpoints";


export class APIMethodGetAutomataByTag
    extends APIMethodBase<
        APIMethodDataResponse<AutomatonCard[]>
    > {

    async execute(
        tagId: string,
    ): Promise<
        APIMethodDataResponse<AutomatonCard[]>
    > {
        return this.request(
            TAG_ENDPOINTS.automata(tagId),
        );
    }

    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<
        AutomatonCard[]
    > {

        if (!response.ok) {
            return new APIMethodDataResponse<AutomatonCard[]>(
                response,
                undefined,
                this.createError(
                    response,
                    data,
                ),
            );
        }

        return new APIMethodDataResponse<AutomatonCard[]>(
            response,
            data as AutomatonCard[],
        );
    }
}
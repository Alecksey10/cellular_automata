import {
    APIMethodBase,
} from "../APIMethodBase";

import {
    APIMethodDataResponse,
} from "../APIMethodDataResponse";

import type {
    Tag,
} from "./types";

import {
    TAG_ENDPOINTS,
} from "./endpoints";


export class APIMethodGetTags
    extends APIMethodBase<
        APIMethodDataResponse<Tag[]>
    > {

    async execute(): Promise<
        APIMethodDataResponse<Tag[]>
    > {
        return this.request(
            TAG_ENDPOINTS.list,
        );
    }

    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<Tag[]> {

        if (!response.ok) {
            return new APIMethodDataResponse<Tag[]>(
                response,
                undefined,
                this.createError(
                    response,
                    data,
                ),
            );
        }

        return new APIMethodDataResponse<Tag[]>(
            response,
            data as Tag[],
        );
    }
}
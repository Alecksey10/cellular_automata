import { APIMethodBase } from "../APIMethodBase";
import { APIMethodDataResponse } from "../APIMethodDataResponse";
import { AUTOMATA_ENDPOINTS } from "./endpoints";
import type {
    AutomatonSearchResponse,
    AutomatonSearchRequest,
} from "./types";


export class APIMethodSearchAutomatas
    extends APIMethodBase<APIMethodDataResponse<AutomatonSearchResponse>>
{
    async execute(
        request: AutomatonSearchRequest,
    ): Promise<APIMethodDataResponse<AutomatonSearchResponse>> {

        return this.request(
            AUTOMATA_ENDPOINTS.automata_search(
                request,
            ),
            {
                method: "GET",
            },
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<AutomatonSearchResponse> {

        if (!response.ok) {
            return new APIMethodDataResponse<AutomatonSearchResponse>(
                response,
                undefined,
                this.createError(
                    response,
                    data,
                ),
            );
        }

        return new APIMethodDataResponse(
            response,
            data as AutomatonSearchResponse,
        );
    }
}

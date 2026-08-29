import { APIMethodBase } from "../APIMethodBase";
import { APIMethodDataResponse } from "../APIMethodDataResponse";
import { AUTOMATA_ENDPOINTS } from "./enpoints";
import type {
    AutomatonCreateRequest,
    AutomatonCreateResponse,
} from "./types";


export interface AutomataUpdateRequest extends AutomatonCreateRequest {
    automataID: string;
}


export class APIMethodUpdateAutomata
    extends APIMethodBase<APIMethodDataResponse<AutomatonCreateResponse>>
{
    async execute(
        request: AutomataUpdateRequest,
    ): Promise<APIMethodDataResponse<AutomatonCreateResponse>> {

        const { automataID, ...body } = request;

        return this.request(
            AUTOMATA_ENDPOINTS.automata_update(automataID),
            {
                method: "PATCH",
                body,
            },
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<AutomatonCreateResponse> {

        if (!response.ok) {
            return new APIMethodDataResponse<AutomatonCreateResponse>(
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
            data as AutomatonCreateResponse,
        );
    }
}

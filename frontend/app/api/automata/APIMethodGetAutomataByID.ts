
import { APIMethodBase } from "../APIMethodBase";
import { APIMethodDataResponse } from "../APIMethodDataResponse";
import { APIMethodResponseBase } from "../APIMethodResponseBase";
import { AUTOMATA_ENDPOINTS } from "./endpoints";
import type { AutomatonSourceCode, AutomatonGetResponse } from "./types";


export interface AutomataSourceRequest {
    automataID: string;
}


export class APIMethodGetAutomataSourceByID extends APIMethodBase<APIMethodDataResponse<AutomatonSourceCode>>
{
    
        async execute(
            request: AutomataSourceRequest,
        ): Promise<APIMethodDataResponse<AutomatonSourceCode>> {
    
            return this.request(
                AUTOMATA_ENDPOINTS.automata_source(request.automataID),
                {
                    method: "GET"
                },
            );
        }
    
    
        protected createResponse(
            response: Response,
            data: unknown,
        ): APIMethodDataResponse<AutomatonSourceCode> {
    
            if (!response.ok) {
                return new APIMethodDataResponse<AutomatonSourceCode>(
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
                data as AutomatonSourceCode,
            );
        }
}

export interface AutomataRequest {
    automataID: string;
}


export class APIMethodGetAutomataByID
    extends APIMethodBase<APIMethodDataResponse<AutomatonGetResponse>>
{
    async execute(
        request: AutomataRequest,
    ): Promise<APIMethodDataResponse<AutomatonGetResponse>> {

        return this.request(
            AUTOMATA_ENDPOINTS.automata_by_id(request.automataID),
            {
                method: "GET",
            },
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<AutomatonGetResponse> {

        if (!response.ok) {
            return new APIMethodDataResponse<AutomatonGetResponse>(
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
            data as AutomatonGetResponse,
        );
    }
}

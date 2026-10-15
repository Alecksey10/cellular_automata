
import { APIMethodBase } from "../APIMethodBase";
import { APIMethodDataResponse } from "../APIMethodDataResponse";
import { AUTOMATA_ENDPOINTS } from "./endpoints";
import type { AutomatonCreateRequest, AutomatonCreateResponse, AutomatonSourceCode } from "./types";


export interface AutomataCreateRequest {
    automataID: string;
}


export class APIMethodCreateAutomata extends APIMethodBase<APIMethodDataResponse<AutomatonCreateResponse>>
{
    
        async execute(
            request: AutomatonCreateRequest,
        ): Promise<APIMethodDataResponse<AutomatonCreateResponse>> {
            return this.request(
                AUTOMATA_ENDPOINTS.automata_create(),
                {
                    method: "POST",
                    body: request
                },
            );
        };
    
    
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
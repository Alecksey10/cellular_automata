
import { APIMethodBase } from "../APIMethodBase";
import { APIMethodDataResponse } from "../APIMethodDataResponse";
import { APIMethodResponseBase } from "../APIMethodResponseBase";
import { AUTOMATA_ENDPOINTS } from "./enpoints";
import type { AutomatonSourceCode } from "./types";


export interface AutomataSourceRequest {
    automataID: string;
}


export class APIMethodGetAutomataByID extends APIMethodBase<APIMethodDataResponse<AutomatonSourceCode>>
{
    
        async execute(
            request: AutomataSourceRequest,
        ): Promise<APIMethodDataResponse<AutomatonSourceCode>> {
    
            return this.request(
                AUTOMATA_ENDPOINTS.automata(request.automataID),
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
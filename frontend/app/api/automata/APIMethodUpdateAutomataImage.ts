import { APIMethodBase } from "../APIMethodBase";
import { APIMethodData } from "../APIMethodData";
import { APIMethodDataResponse } from "../APIMethodDataResponse";
import { AUTOMATA_ENDPOINTS } from "./endpoints";
import type {
    AutomatonCreateRequest,
    AutomatonCreateResponse,
    AutomatonUpdateImageRequest,
} from "./types";


export class APIMethodUpdateAutomataImage
    extends APIMethodData<APIMethodDataResponse<AutomatonCreateResponse>>
{
    async execute(
        request: AutomatonUpdateImageRequest,
    ): Promise<APIMethodDataResponse<AutomatonCreateResponse>> {

        const { automataID, ...body } = request;
        const data = new FormData()
        data.append("data", body.data as File)

        return this.request(
            AUTOMATA_ENDPOINTS.automata_update_image(automataID),
            {
                method: "PATCH",
                body:data
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

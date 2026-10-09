import { APIMethodBase } from "../APIMethodBase";
import { APIMethodDataResponse } from "../APIMethodDataResponse";
import { AUTOMATA_ENDPOINTS } from "./enpoints";
import type {
    AutomatonsGetImagesRequest,
    AutomatonCreateResponse,
    AutomatonsGetImagesResponse,
} from "./types";

export class APIMethodGetAutomatasImages
    extends APIMethodBase<APIMethodDataResponse<AutomatonsGetImagesResponse>>
{
    async execute(
        request: AutomatonsGetImagesRequest,
    ): Promise<APIMethodDataResponse<AutomatonsGetImagesResponse>> {
        return this.request(
            AUTOMATA_ENDPOINTS.automatas_get_images(request.images_ids),
            {
                method: "GET",
                // body,
            },
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<AutomatonsGetImagesResponse> {

        if (!response.ok) {
            return new APIMethodDataResponse<AutomatonsGetImagesResponse>(
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
            data as AutomatonsGetImagesResponse,
        );
    }
}

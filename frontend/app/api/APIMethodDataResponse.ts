import {
    APIMethodResponseBase,
} from "./APIMethodResponseBase";


export class APIMethodDataResponse<T>
    extends APIMethodResponseBase {

    readonly data?: T;

    constructor(
        response: Response,
        data?: T,
        error?: {
            code?: string;
            message?: string;
            details?: unknown;
        },
    ) {
        super(
            response.ok,
            response.status,
            error,
        );

        this.data = data;
    }
}
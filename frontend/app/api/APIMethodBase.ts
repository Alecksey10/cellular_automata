import {
    apiConfig,
} from "./Config";


import type {
    APIError,
} from "./APIMethodResponseBase";

import {
    APIMethodResponseBase,
} from "./APIMethodResponseBase";


export interface APIMethodRequest {
    method?: string;
    body?: unknown;
    headers?: HeadersInit;
}


export abstract class APIMethodBase<
    TResponse extends APIMethodResponseBase,
> 
{

    protected abstract createResponse(
        response: Response,
        data: unknown,
    ): TResponse;


    protected async request(
        path: string,
        request: APIMethodRequest = {},
    ): Promise<TResponse> {

        const response =
            await fetch(
                `${apiConfig.baseUrl}${path}`,
                {
                    method:
                        request.method ?? "GET",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...request.headers,
                    },

                    credentials: "include",

                    body:
                        request.body !== undefined
                            ? JSON.stringify(
                                request.body,
                            )
                            : undefined,
                },
            );


        let data: unknown = undefined;

        try {
            data =
                await response.json();
        } catch {
            // Ответ может не содержать JSON.
        }
        return this.createResponse(
            response,
            data,
        );
    }


    protected createError(
        response: Response,
        data: unknown,
    ): APIError {

        if (
            typeof data === "object" &&
            data !== null
        ) {
            const value =
                data as Record<string, unknown>;

            return {
                code:
                    typeof value.code === "string"
                        ? value.code
                        : String(response.status),

                message:
                    typeof value.message === "string"
                        ? value.message
                        : undefined,

                detail:
                    value.detail,
            };
        }


        return {
            message:
                `HTTP ${response.status}`,
        };
    }
}
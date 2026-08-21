

import {
    AUTH_ENDPOINTS,
} from "./endpoints";

import {
    APIMethodBase,
} from "../APIMethodBase";

import {
    APIMethodDataResponse
} from "../APIMethodDataResponse"
import { APIMethodResponseBase } from "../APIMethodResponseBase";


export interface User {
    id: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}


export class APIMethodLogin
    extends APIMethodBase<APIMethodDataResponse<User>> {

    async execute(
        request: LoginRequest,
    ): Promise<APIMethodDataResponse<User>> {

        return this.request(
            AUTH_ENDPOINTS.login,
            {
                method: "POST",
                body: request,
            },
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<User> {

        if (!response.ok) {
            return new APIMethodDataResponse<User>(
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
            data as User,
        );
    }
}

export class APIMethodMe
    extends APIMethodBase<
        APIMethodDataResponse<User>
    > {

    async execute(): Promise<
        APIMethodDataResponse<User>
    > {
        return this.request(
            AUTH_ENDPOINTS.me,
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<User> {

        if (!response.ok) {
            return new APIMethodDataResponse<User>(
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
            data as User,
        );
    }
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    username: string;
    email: string;
    password: string;

}


export class APIMethodRegister
    extends APIMethodBase<
        APIMethodDataResponse<RegisterResponse>
    > {

    async execute(
        request: RegisterRequest,
    ): Promise<APIMethodDataResponse<RegisterResponse>> {

        return this.request(
            AUTH_ENDPOINTS.register,
            {
                method: "POST",
                body: request,
            },
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodDataResponse<RegisterResponse> {
        
        if (!response.ok) {
            let result =  new APIMethodDataResponse<RegisterResponse>(
                response,
                undefined,
                this.createError(
                    response,
                    data,
                ),
            );
            return result;
        }
        

        return new APIMethodDataResponse(
            response,
            data as RegisterResponse,
        );
    }
}

export class APIMethodLogoutResponse
    extends APIMethodResponseBase {

    constructor(
        response: Response,
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
    }
}

export class APIMethodLogout
    extends APIMethodBase<
        APIMethodLogoutResponse
    > {

    async execute(): Promise<
        APIMethodLogoutResponse
    > {

        return this.request(
            AUTH_ENDPOINTS.logout,
            {
                method: "POST",
            },
        );
    }


    protected createResponse(
        response: Response,
        data: unknown,
    ): APIMethodLogoutResponse {

        if (!response.ok) {
            return new APIMethodLogoutResponse(
                response,
                this.createError(
                    response,
                    data,
                ),
            );
        }

        return new APIMethodLogoutResponse(
            response,
        );
    }
}
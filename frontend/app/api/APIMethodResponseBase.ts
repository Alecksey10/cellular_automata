export interface APIError {
    code?: string;
    message?: string;
    detail?: unknown;
}


export abstract class APIMethodResponseBase {
    readonly ok: boolean;
    readonly status: number;
    readonly error?: APIError;

    protected constructor(
        ok: boolean,
        status: number,
        error?: APIError,
    ) {
        this.ok = ok;
        this.status = status;
        this.error = error;
    }
}
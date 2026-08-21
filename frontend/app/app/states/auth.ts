import type { APIMethodDataResponse } from "../../api/APIMethodDataResponse";
import { APIMethodMe, type User } from "../../api/auth/auth";

export class AuthenticationState {
    public userID: string | null;
    public isAuth: boolean;

    constructor(
        userID: string | null = null,
        isAuth: boolean = false,
    ) {
        this.userID = userID;
        this.isAuth = isAuth;
    }
}

export class AuthenticationManager {
    private state: AuthenticationState;

    constructor() {
        this.state = new AuthenticationState();
    }

    getState(): AuthenticationState {
        return this.state;
    }

    async synchronize(): Promise<void> {
        // Здесь потом:
        
        const request = new APIMethodMe();
        const response:APIMethodDataResponse<User> = await request.execute()
        console.log(response)
        console.log(this.state)
        
        if (response.ok) {
            this.state = new AuthenticationState(
            String(response.data?.id as number),
            true)
        } else {
            this.state = new AuthenticationState(
            null,
            false)
        }
    }

    authenticate(userID: string): void {
        this.state = new AuthenticationState(
            userID,
            true,
        );
    }

    unauthenticate(): void {
        this.state = new AuthenticationState(
            null,
            false,
        );
    }
}

export const authenticationManager =
    new AuthenticationManager();


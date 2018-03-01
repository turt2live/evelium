export interface LoginResponse {
    user_id: string;
    access_token: string;
    device_id: string;

    /**
     * @deprecated This is deprecated in the spec
     */
    home_server: string;
}

export interface LoginRequest {
    type: string;
    user: string;
    device_id?: string;
}

export class PasswordLoginRequest implements LoginRequest {
    public readonly type = "m.login.password";

    constructor(public user: string, public password: string) {
    }
}

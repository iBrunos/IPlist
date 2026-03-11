import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            equipe: any;
            role: any;
        };
    } | {
        mfa_required: boolean;
        username: string;
    }>;
    loginMfa(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            equipe: any;
            role: any;
        };
    }>;
}

import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { RadiusService } from './radius.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private audit;
    private radius;
    constructor(prisma: PrismaService, jwtService: JwtService, audit: AuditService, radius: RadiusService);
    login(username: string, password: string): Promise<{
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
    loginWithMfa(username: string, password: string, token: string): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            equipe: any;
            role: any;
        };
    }>;
    private generateToken;
}

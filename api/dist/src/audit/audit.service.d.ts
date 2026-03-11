import { PrismaService } from '../database/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        action: string;
        entity: string;
        entityId?: string;
        details?: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        details: string | null;
        userId: string | null;
    }>;
    findAll(requester: any): Promise<({
        user: {
            username: string;
            equipe: string;
            role: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        details: string | null;
        userId: string | null;
    })[]>;
}

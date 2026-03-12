import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(req: any, page?: string, limit?: string, search?: string): Promise<{
        data: ({
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}

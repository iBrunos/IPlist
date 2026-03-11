import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(req: any): Promise<({
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

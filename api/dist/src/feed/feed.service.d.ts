import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class FeedService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    private isExpired;
    getIpFeed(): Promise<string>;
    getHashFeed(): Promise<string>;
    getDomainFeed(): Promise<string>;
}

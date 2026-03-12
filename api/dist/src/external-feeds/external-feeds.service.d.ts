import { PrismaService } from '../database/prisma.service';
export declare class ExternalFeedsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        createdBy: {
            username: string;
        } | null;
    } & {
        url: string;
        id: string;
        createdAt: Date;
        name: string;
        createdById: string | null;
        type: string;
        interval: number;
        active: boolean;
        lastSyncAt: Date | null;
        lastCount: number;
    })[]>;
    create(data: any, requester: any): import("@prisma/client").Prisma.Prisma__ExternalFeedClient<{
        url: string;
        id: string;
        createdAt: Date;
        name: string;
        createdById: string | null;
        type: string;
        interval: number;
        active: boolean;
        lastSyncAt: Date | null;
        lastCount: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__ExternalFeedClient<{
        url: string;
        id: string;
        createdAt: Date;
        name: string;
        createdById: string | null;
        type: string;
        interval: number;
        active: boolean;
        lastSyncAt: Date | null;
        lastCount: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ExternalFeedClient<{
        url: string;
        id: string;
        createdAt: Date;
        name: string;
        createdById: string | null;
        type: string;
        interval: number;
        active: boolean;
        lastSyncAt: Date | null;
        lastCount: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    previewContent(text: string): {
        counts: {
            ip: number;
            hash: number;
            domain: number;
            unknown: number;
            total: number;
        };
        samples: {
            ip: string[];
            hash: string[];
            domain: string[];
        };
    };
    importContent(text: string, name: string, requester: any): Promise<{
        imported: {
            ip: number;
            hash: number;
            domain: number;
            skipped: number;
        };
        total: number;
    }>;
    syncFeed(id: string): Promise<{
        synced: number;
        feedName: any;
    }>;
    syncAllActive(): Promise<void>;
    private _processFeed;
}

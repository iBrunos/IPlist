import { ExternalFeedsService } from './external-feeds.service';
export declare class ExternalFeedsController {
    private readonly service;
    constructor(service: ExternalFeedsService);
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
    create(body: any, req: any): import("@prisma/client").Prisma.Prisma__ExternalFeedClient<{
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
    preview(file: Express.Multer.File, content: string): Promise<{
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
    }>;
    importFile(file: Express.Multer.File, content: string, name: string, req: any): Promise<{
        imported: {
            ip: number;
            hash: number;
            domain: number;
            skipped: number;
        };
        total: number;
    }>;
    update(id: string, body: any): import("@prisma/client").Prisma.Prisma__ExternalFeedClient<{
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
    sync(id: string): Promise<{
        synced: number;
        feedName: any;
    }>;
}

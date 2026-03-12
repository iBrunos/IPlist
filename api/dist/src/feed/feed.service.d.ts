import { PrismaService } from '../database/prisma.service';
export declare class FeedService {
    private prisma;
    constructor(prisma: PrismaService);
    getIps(): Promise<string[]>;
    getHashes(): Promise<string[]>;
    getDomains(): Promise<string[]>;
}

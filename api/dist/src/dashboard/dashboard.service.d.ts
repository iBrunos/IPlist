import { PrismaService } from '../database/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(range?: string): Promise<{
        totalIps: number;
        totalHashes: number;
        totalDomains: number;
        pendingTotal: number;
        pendingIps: number;
        pendingHashes: number;
        pendingDomains: number;
        recentLogs: ({
            user: {
                username: string;
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
        chartData: {
            date: string;
            ips: number;
            hashes: number;
            domains: number;
        }[];
        range: string;
    }>;
    private getChartData;
}

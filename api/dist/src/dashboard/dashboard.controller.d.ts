import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
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
        last7Days: {
            date: string;
            ips: number;
            hashes: number;
            domains: number;
        }[];
    }>;
}

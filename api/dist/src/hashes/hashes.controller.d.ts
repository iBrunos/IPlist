import { HashesService } from './hashes.service';
export declare class HashesController {
    private readonly hashesService;
    constructor(hashesService: HashesService);
    create(body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
        value: string;
        type: string;
    }>;
    findAll(req: any, page?: string, limit?: string, search?: string): Promise<{
        data: ({
            createdBy: {
                username: string;
                equipe: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            expiresAt: Date | null;
            status: string;
            createdById: string;
            approvedById: string | null;
            value: string;
            type: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    approve(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
        value: string;
        type: string;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
        value: string;
        type: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
        value: string;
        type: string;
    }>;
}

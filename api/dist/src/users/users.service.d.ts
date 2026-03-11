import { PrismaService } from '../database/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, requester: any): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        equipe: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(requester: any): Promise<{
        id: string;
        username: string;
        email: string;
        equipe: string;
        role: string;
        createdAt: Date;
    }[]>;
    update(id: string, data: any, requester: any): Promise<{
        id: string;
        username: string;
        email: string;
        equipe: string;
        role: string;
    }>;
    remove(id: string, requester: any): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        equipe: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

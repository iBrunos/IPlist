import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(body: any, req: any): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        equipe: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(req: any): Promise<{
        id: string;
        username: string;
        email: string;
        equipe: string;
        role: string;
        createdAt: Date;
    }[]>;
    update(id: string, body: any, req: any): Promise<{
        id: string;
        username: string;
        email: string;
        equipe: string;
        role: string;
    }>;
    remove(id: string, req: any): Promise<{
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

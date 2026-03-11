"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const roles_enum_1 = require("../auth/roles.enum");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, requester) {
        if (requester.role === roles_enum_1.Role.TECNICO) {
            throw new common_1.ForbiddenException('Sem permissão para criar usuários');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO) {
            if (data.role !== roles_enum_1.Role.TECNICO) {
                throw new common_1.ForbiddenException('Líder técnico só pode criar técnicos');
            }
            if (data.equipe !== requester.equipe) {
                throw new common_1.ForbiddenException('Só pode criar usuários da sua equipe');
            }
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        try {
            return await this.prisma.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    password: hashedPassword,
                    equipe: data.equipe,
                    role: data.role,
                }
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Username ou email já existe');
            }
            throw error;
        }
    }
    async findAll(requester) {
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO) {
            return this.prisma.user.findMany({
                where: { equipe: requester.equipe, role: roles_enum_1.Role.TECNICO },
                select: { id: true, username: true, email: true, equipe: true, role: true, createdAt: true }
            });
        }
        return this.prisma.user.findMany({
            select: { id: true, username: true, email: true, equipe: true, role: true, createdAt: true }
        });
    }
    async update(id, data, requester) {
        const target = await this.prisma.user.findUnique({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (requester.role === roles_enum_1.Role.TECNICO) {
            throw new common_1.ForbiddenException('Sem permissão para editar usuários');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO) {
            if (target.role !== roles_enum_1.Role.TECNICO || target.equipe !== requester.equipe) {
                throw new common_1.ForbiddenException('Só pode editar técnicos da sua equipe');
            }
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, username: true, email: true, equipe: true, role: true }
        });
    }
    async remove(id, requester) {
        const target = await this.prisma.user.findUnique({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (requester.role === roles_enum_1.Role.TECNICO) {
            throw new common_1.ForbiddenException('Sem permissão para apagar usuários');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO) {
            if (target.role !== roles_enum_1.Role.TECNICO || target.equipe !== requester.equipe) {
                throw new common_1.ForbiddenException('Só pode apagar técnicos da sua equipe');
            }
        }
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
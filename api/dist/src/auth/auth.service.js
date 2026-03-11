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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const audit_service_1 = require("../audit/audit.service");
const radius_service_1 = require("./radius.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    audit;
    radius;
    constructor(prisma, jwtService, audit, radius) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.audit = audit;
        this.radius = radius;
    }
    async login(username, password) {
        const localUser = await this.prisma.user.findUnique({
            where: { username }
        });
        if (localUser) {
            const passwordValid = await bcrypt.compare(password, localUser.password);
            if (passwordValid) {
                return this.generateToken(localUser);
            }
        }
        return { mfa_required: true, username };
    }
    async loginWithMfa(username, password, token) {
        const success = await this.radius.authenticate(username, `${password}${token}`);
        if (!success) {
            throw new common_1.UnauthorizedException('Credenciais ou token inválidos');
        }
        let user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    username,
                    email: `${username}@adpms.local`,
                    password: await bcrypt.hash(Math.random().toString(36), 10),
                    equipe: 'AD',
                    role: 'tecnico',
                }
            });
        }
        return this.generateToken(user);
    }
    async generateToken(user) {
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            equipe: user.equipe,
        };
        await this.audit.log({
            action: 'LOGIN',
            entity: 'USER',
            entityId: user.id,
            details: `Usuário ${user.username} fez login`,
            userId: user.id,
        });
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                equipe: user.equipe,
                role: user.role,
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        audit_service_1.AuditService,
        radius_service_1.RadiusService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
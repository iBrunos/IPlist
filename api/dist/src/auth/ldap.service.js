"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LdapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapService = void 0;
const common_1 = require("@nestjs/common");
const ldapts_1 = require("ldapts");
let LdapService = LdapService_1 = class LdapService {
    logger = new common_1.Logger(LdapService_1.name);
    url = process.env.LDAP_URL || 'ldap://10.201.131.11:389';
    baseDN = process.env.LDAP_BASE_DN || 'DC=ADPMS,DC=local';
    bindDN = process.env.LDAP_BIND_DN;
    bindPassword = process.env.LDAP_BIND_PASSWORD;
    groupRoleMap = {
        'CN=SUPER_ADMIN_BIP,OU=Grupos,OU=COGEL,OU=PMS,DC=ADPMS,DC=local': 'super_admin',
        'CN=LIDER_TECNICO_BIP,OU=Grupos,OU=COGEL,OU=PMS,DC=ADPMS,DC=local': 'lidertecnico',
        'CN=TECNICO_BIP,OU=Grupos,OU=COGEL,OU=PMS,DC=ADPMS,DC=local': 'tecnico',
    };
    async authenticate(username, password) {
        const client = new ldapts_1.Client({
            url: this.url,
            tlsOptions: { rejectUnauthorized: false },
        });
        try {
            if (this.bindDN && this.bindPassword) {
                await client.bind(this.bindDN, this.bindPassword);
            }
            const { searchEntries } = await client.search(this.baseDN, {
                scope: 'sub',
                filter: `(&(objectClass=person)(sAMAccountName=${username}))`,
                attributes: ['dn', 'mail', 'department', 'memberOf'],
            });
            if (!searchEntries.length) {
                this.logger.warn(`Usuário ${username} não encontrado no LDAP`);
                return { success: false };
            }
            const userEntry = searchEntries[0];
            const userDN = userEntry.dn;
            await client.bind(userDN, password);
            const memberOf = userEntry.memberOf;
            const groups = Array.isArray(memberOf) ? memberOf : memberOf ? [memberOf] : [];
            let role;
            for (const group of groups) {
                if (this.groupRoleMap[group]) {
                    role = this.groupRoleMap[group];
                    break;
                }
            }
            if (!role) {
                this.logger.warn(`Usuário ${username} não pertence a nenhum grupo BIP`);
                return { success: false };
            }
            return {
                success: true,
                role,
                email: userEntry.mail,
                equipe: userEntry.department,
            };
        }
        catch (err) {
            this.logger.error(`Erro LDAP: ${err.message}`);
            return { success: false };
        }
        finally {
            await client.unbind();
        }
    }
};
exports.LdapService = LdapService;
exports.LdapService = LdapService = LdapService_1 = __decorate([
    (0, common_1.Injectable)()
], LdapService);
//# sourceMappingURL=ldap.service.js.map
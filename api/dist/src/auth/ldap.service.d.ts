export declare class LdapService {
    private readonly logger;
    private readonly url;
    private readonly baseDN;
    private readonly bindDN;
    private readonly bindPassword;
    private readonly groupRoleMap;
    authenticate(username: string, password: string): Promise<{
        success: boolean;
        role?: string;
        email?: string;
        equipe?: string;
    }>;
}

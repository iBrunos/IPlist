export declare class RadiusService {
    private readonly logger;
    private readonly secret;
    private readonly client;
    authenticate(username: string, password: string): Promise<boolean>;
}

import type { Response } from 'express';
import { FeedService } from './feed.service';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    ips(res: Response): Promise<void>;
    hashes(res: Response): Promise<void>;
    domains(res: Response): Promise<void>;
}

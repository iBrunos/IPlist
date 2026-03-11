import type { Response } from 'express';
import { FeedService } from './feed.service';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    getIpFeed(res: Response): Promise<void>;
    getHashFeed(res: Response): Promise<void>;
    getDomainFeed(res: Response): Promise<void>;
}

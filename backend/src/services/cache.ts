
export interface CacheItem<T> {
    data: T;
    expiry: number;
}

export class APICache<T> {
    private cache: Map<string, CacheItem<T>> = new Map();
    private defaultTtl: number;

    constructor(defaultTtl: number = 3600000) {
        this.defaultTtl = defaultTtl;
    }

    get(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    set(key: string, data: T, ttlMs?: number): void {
        this.cache.set(key, {
            data,
            expiry: Date.now() + (ttlMs || this.defaultTtl)
        });
    }

    generateKey(prefix: string, ...args: any[]): string {
        return `${prefix}:${args.map(a => JSON.stringify(a)).join(':')}`;
    }
}

// Default instance for general use
export const apiCache = new APICache<any>();

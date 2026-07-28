const { Redis } = require("ioredis");

let redis;

// Jab Jest tests chalenge (NODE_ENV === 'test'), tab FakeRedis use hoga
if (process.env.NODE_ENV === "test") {
    class FakeRedis {
        constructor() {
            this.store = new Map();
            this.expires = new Map();
        }

        async set(key, value, ...args) {
            this.store.set(key, value);

            // Optional EX TTL (Expiration Time in Seconds) handle karne ke liye
            if (args && args.length >= 2) {
                const exIndex = args.findIndex(
                    (a) => String(a).toUpperCase() === "EX"
                );
                if (exIndex !== -1 && args[exIndex + 1]) {
                    const seconds = Number(args[exIndex + 1]);
                    const expireAt = Date.now() + seconds * 1000;
                    this.expires.set(key, expireAt);
                } else {
                    this.expires.delete(key);
                }
            } else {
                this.expires.delete(key);
            }

            return "OK";
        }

        async get(key) {
            // Check expiry before returning data
            if (this.expires.has(key)) {
                const expireAt = this.expires.get(key);
                if (Date.now() > expireAt) {
                    this.store.delete(key);
                    this.expires.delete(key);
                    return null;
                }
            }
            return this.store.get(key) || null;
        }

        async del(key) {
            this.store.delete(key);
            this.expires.delete(key);
            return 1;
        }
    }

    redis = new FakeRedis();
} else {
    // Normal Development / Production ke liye Real Redis Connection
    redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
    });

    redis.on("connect", () => {
        console.log("Connected to Redis");
    });
}

module.exports = redis;
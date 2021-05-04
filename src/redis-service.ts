import redis from 'redis'

if (!process.env.REDIS_TLS_URL)
    throw new Error("Invalid REDIS_URL");

export const { redisGetAsync, redisSetAsync } = (() => {
    // const redisURL = new URL(process.env.REDIS_URL) as unknown as { port: number, hostname: string, password: string };
    // const redisClient = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true });


    const redisClient = redis.createClient(process.env.REDIS_TLS_URL, {
        tls: {
            rejectUnauthorized: false
        }
    });
    // console.log(redisURL);
    // redisClient.auth(redisURL.password);

    const redisGetAsync = (key: string) => {
        return new Promise<string | null>((resolve, reject) => {
            redisClient.get(key, (err, value) => {
                if (err)
                    reject(err);
                else
                    resolve(value);
            })
        })
    }

    const redisSetAsync = (key: string, value: string, expireInSeconds: number) => {
        return new Promise<void>((resolve, reject) => {
            redisClient.set(key, value, 'EX', expireInSeconds, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            })
        })
    }

    return {
        redisClient,
        redisGetAsync,
        redisSetAsync
    };
})();
import {createClient} from 'redis'

export const redisClient = createClient({
    url: process.env.REDIS_URL,
})
    
redisClient.on("error",(error)=> console.log("Redis error: ",error))

export const connectRedisDB = async () => {
    try {
        await redisClient.connect()
        console.log("Connect To Redis");
    } catch (error) {
        console.log("Redis connection failed",error.message);   
    }
}

import {createClient} from 'redis'

export const redisClient = createClient({
    url: "redis://127.0.0.1:6379"
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

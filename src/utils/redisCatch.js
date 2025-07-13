import { redisClient } from "../db/redis.js"

export const redisCatch = (key, cb, ttl=3600)=>{
    return new Promise.resolve(async (resolve,reject)=>{
        try {
            const catched = await redisClient.get(key)
    
            if(catched){
                return JSON.parse(catched)
            }
    
            const fresh = await cb();
            await redisClient.setEx(key,ttl,JSON.stringify(fresh));
            return fresh;
        } catch (error) {
            console.log("Redis catch error: ",error);
            return await cb();
        }
    })
}
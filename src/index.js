import dotenv from 'dotenv'
dotenv.config();
import {connectDB} from "./db/index.js";
import { connectRedisDB } from './db/redis.js';

import { app } from './app.js';

const port  = process.env.PORT;

const startApp = async () => {
    try {
        await connectDB();
        console.log("Mongoose DB connected");
        
        await connectRedisDB();
        console.log("Redis DB connected");

        app.listen(port,()=>{
            console.log(`Server running at http://localhost:${port}`);
        })

    } catch (error) {
        console.log("App Server failed", error.message);
        process.exit(1);
    }
    
}

startApp();









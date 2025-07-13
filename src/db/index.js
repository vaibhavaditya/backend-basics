import mongoose from "mongoose";
import { DB_NAME } from '../constant.js';

export const  connectDB = async () => {
    try {
            const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}`)
            console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        } catch (error) {
            console.log("MONGODB connected error: ", error.message);
            process.exit(1);
        }
}


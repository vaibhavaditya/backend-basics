import dotenv from 'dotenv'
dotenv.config({path: '../.env'});
import connectDB from "./db/index.js";

import { app } from './app.js';

connectDB()
.then(() => {
    app.listen(process.env.PORT || 4000, ()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);   
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed!!! ", error);
    
})








// import mongoose from "mongoose";
// import { DB_NAME } from "./constant";
// import express from 'express';

// const app = express()

// (async()=>{

//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log("Err: ", error);
//         })

//     } catch (error) {
//         console.log("Error: ", error);
//         throw error 
//     }

// })()
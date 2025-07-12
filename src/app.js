import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
// import { errorMiddleware } from './middlewares/error.middleware.js';


const app = express()

const limiter = rateLimit({
    windowMs: 5*60*1000,
    max: 50,
    message: "Too many arguments please try later"
})

app.use(helmet())
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}))

app.use(limiter)
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static('public'));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("Home");
    
})
//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'

 //routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/subscription",subscriptionRouter)
// app.use(errorMiddleware);
export {app}
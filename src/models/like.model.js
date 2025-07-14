import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },

    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },

    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },

    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

likeSchema.index({ video: 1, likedBy: 1 });
likeSchema.index({ comment: 1, likedBy: 1 });
likeSchema.index({ tweet: 1, likedBy: 1 });
likeSchema.index({ likedBy: 1 });

export const Like = mongoose.model('Like',likeSchema)
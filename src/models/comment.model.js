import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },

    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        index: true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }
},{timestamps: true})

commentSchema.index({video: 1,owner: 1})

export const Comment = mongoose.model('Comment',commentSchema)
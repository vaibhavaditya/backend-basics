import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    description:{
        type: String
    },

    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }
    
},{timestamps: true})

playlistSchema.index({ owner: 1 });
playlistSchema.index({ name: "text", description: "text" });
playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model('Playlist',playlistSchema)
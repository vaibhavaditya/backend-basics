import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetsSchema = new Schema({
    content: {
        type: String,
        required: true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },

    imagesUpload:[
        {
            type: String
        }
    ]
    
},{timestamps: true})

tweetsSchema.index({owner: 1})
export const Tweet = mongoose.model('Tweet',tweetsSchema)
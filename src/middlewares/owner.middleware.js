import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


const getValueFromPath = (obj,path) => {
    return path.split('.').reduce((acc,key)=> acc?.[key],obj);
}
export const checkOwner = (Model,idPath,ownerField = "owner") => 
  asyncHandler(async(req,_,next)=>{
    
    const resourceId  = getValueFromPath(req,idPath);
    if(!isValidObjectId(resourceId )){
        throw new ApiError(401,"Invalid resource id")
    }

    const resource = await Model.findById(resourceId)
     if (!resource) {
      throw new ApiError(404, "Resource not found");
    }

    const resourceOwner= getValueFromPath(resource,ownerField);
    if (resourceOwner?.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to access this resource");
    }

    req.resource = resource;
    next();
})
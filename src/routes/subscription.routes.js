import {Router} from 'express'
import { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers } from '../controllers/subscription.controller.js';
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { Subscription } from '../models/subscription.model.js';
import { checkOwner } from "../middlewares/owner.middleware.js";


const router = Router();
router.use(verifyJwt)

router.route("/c/:channelId").post(toggleSubscription).get(getUserChannelSubscribers);

router.route("/u/:subscriberId").get(checkOwner(Subscription, "params.subscriberId"),getSubscribedChannels);

export default router;
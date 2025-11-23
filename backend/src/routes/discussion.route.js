import {Router} from 'express';
import {createDiscussion,getDiscussions,likeDiscussion,createComment,dislikeDiscussion,deleteDiscussion} from '../controllers/discussion.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { rateLimitMiddleware } from '../middlewares/ratelimiter.middleware.js';
const router = Router();

router.get('/',getDiscussions);
router.post('/',verifyJWT,rateLimitMiddleware,createDiscussion);
router.delete('/:discussionId',verifyJWT,deleteDiscussion);
router.post('/:discussionId/comment',verifyJWT,rateLimitMiddleware,createComment);
router.post('/:discussionId/like',verifyJWT,rateLimitMiddleware,likeDiscussion);
router.post('/:discussionId/dislike',verifyJWT,rateLimitMiddleware,dislikeDiscussion);


export default router;
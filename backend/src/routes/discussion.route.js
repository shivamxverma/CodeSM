import {Router} from 'express';
import {createDiscussion,getDiscussions,likeDiscussion,createComment,dislikeDiscussion,deleteDiscussion} from '../controllers/discussion.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();

router.get('/',getDiscussions);
router.post('/',verifyJWT,createDiscussion);
router.delete('/',verifyJWT,deleteDiscussion);
router.post('/:discussionId/comment',verifyJWT,createComment);
router.get('/:disscussionId/like',verifyJWT,likeDiscussion);
router.get('/:discussionId/dislike',verifyJWT,dislikeDiscussion);


export default router;
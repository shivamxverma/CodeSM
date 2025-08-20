import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Discussion from "../models/discussion.model.js";
import redis from "../config/redis.config.js";

export const createDiscussion = asyncHandler (async (req,res)=>{
    const { title, content, tags } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const existingDiscussion = await Discussion.findOne({ title, user: req.user });

    if(existingDiscussion) {
        throw new ApiError(400, "Discussion with this title already exists");
    }

    const discussion = await Discussion.create({
        title,
        content,
        user: req.user,
        tags: tags || []
    })
    
    if (!discussion) {
        throw new ApiError(500, "Failed to create discussion");
    }

    const cacheExpiry = 60 * 60; 

    redis.setex('allDiscussions', cacheExpiry, JSON.stringify(discussion));

    res.status(201).json(new ApiResponse(201,"Discussion created successfully", discussion));
})

export const getDiscussions = asyncHandler(async (req,res)=> {
    const cachedDiscussions = await redis.get('allDiscussions');
    if (cachedDiscussions) {
        return res.status(200).json(new ApiResponse(200, JSON.parse(cachedDiscussions), "Discussions fetched successfully from cache"));
    }

    const discussions = await Discussion.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    const cacheExpiry = 60 * 60;
    redis.setex('allDiscussions', cacheExpiry, JSON.stringify(discussions));
        
    res.status(200).json(new ApiResponse(200, "Discussions fetched successfully", discussions));
})

export const createComment = asyncHandler(async (req,res)=> {

    const content = req.body;
    const discussionId = req.params;

    if (!discussionId || !content) {
        throw new ApiError(400, "Discussion ID and content are required");
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
        throw new ApiError(404, "Discussion not found");
    }
    
    discussion.comments.push({
        user: req.user._id,
        content
    });

    await discussion.save();

    res.status(201).json(new ApiResponse(201, "Comment added successfully", discussion));
})

export const likeDiscussion = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;
    

    if (!discussionId) {
        throw new ApiError(400, "Discussion ID is required");
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
        throw new ApiError(404, "Discussion not found");
    }

    discussion.like += 1;
    await discussion.save();

    res.status(200).json(new ApiResponse(200, "Discussion liked successfully", discussion));
});

export const dislikeDiscussion = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;

    if (!discussionId) {
        throw new ApiError(400, "Discussion ID is required");
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
        throw new ApiError(404, "Discussion not found");
    }

    discussion.dislike += 1;
    await discussion.save();

    res.status(200).json(new ApiResponse(200, "Discussion disliked successfully", discussion));
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
    const { discussionId } = req.params;

    if (!discussionId) {
        throw new ApiError(400, "Discussion ID is required");
    }

    const discussion = await Discussion.findByIdAndDelete(discussionId);
    if (!discussion) {
        throw new ApiError(404, "Discussion not found");
    }

    res.status(200).json(new ApiResponse(200, "Discussion deleted successfully"));
});
const commentSchema = new Schema({
    discussionId: { type: Schema.Types.ObjectId, ref: 'Discussion', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // for threading
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

import React, { useEffect, useState } from 'react';
import { getAllDiscussion, createDiscussion, likeDiscussion, dislikeDiscussion, createComment } from '@/api/api';
import { useAuth } from '@/auth/AuthContext';

const DiscussionPage = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [commentData, setCommentData] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllDiscussion();
      setDiscussions(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError('Failed to load discussions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to create a discussion');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      await createDiscussion(payload);
      setFormData({ title: '', content: '', tags: '' });
      setShowCreateForm(false);
      fetchDiscussions();
    } catch (err) {
      setError('Failed to create discussion. Please try again.');
      console.error(err);
    }
  };

  const handleLike = async (discussionId) => {
    if (!user) {
      setError('Please login to like discussions');
      return;
    }
    try {
      await likeDiscussion(discussionId);
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to like discussion:', err);
    }
  };

  const handleDislike = async (discussionId) => {
    if (!user) {
      setError('Please login to dislike discussions');
      return;
    }
    try {
      await dislikeDiscussion(discussionId);
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to dislike discussion:', err);
    }
  };

  const handleAddComment = async (discussionId) => {
    if (!user) {
      setError('Please login to comment');
      return;
    }
    const content = commentData[discussionId];
    if (!content || !content.trim()) return;

    try {
      await createComment(discussionId, { content });
      setCommentData({ ...commentData, [discussionId]: '' });
      fetchDiscussions();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const toggleComments = (discussionId) => {
    setShowComments(prev => ({ ...prev, [discussionId]: !prev[discussionId] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
            <p className="mt-1 text-sm text-slate-400">Share ideas, ask questions, and engage with the community</p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Discussion
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">Create New Discussion</h2>
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter discussion title"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  required
                  rows="6"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="javascript, algorithms, data-structures"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Post Discussion
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 h-6 w-2/3 rounded bg-white/10" />
                <div className="mb-4 h-4 w-1/3 rounded bg-white/10" />
                <div className="mb-2 h-4 rounded bg-white/10" />
                <div className="h-4 w-5/6 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto mb-3 size-12 rounded-full bg-white/10" />
            <div className="text-lg font-medium">No discussions yet</div>
            <div className="mt-1 text-sm text-slate-400">Be the first to start a discussion!</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {discussions.map((discussion) => (
              <div
                key={discussion._id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition hover:shadow-lg"
              >
                <div className="mb-4">
                  <h2 className="mb-2 text-xl font-semibold text-white">{discussion.title}</h2>
                  <p className="text-sm text-slate-300">{discussion.content}</p>
                </div>

                {discussion.tags && discussion.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {discussion.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300 ring-1 ring-indigo-400/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                  <button
                    onClick={() => handleLike(discussion._id)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                    </svg>
                    {discussion.like || 0}
                  </button>
                  <button
                    onClick={() => handleDislike(discussion._id)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
                    </svg>
                    {discussion.dislike || 0}
                  </button>
                  <button
                    onClick={() => toggleComments(discussion._id)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {discussion.comments?.length || 0} Comments
                  </button>
                </div>

                {showComments[discussion._id] && (
                  <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                    {discussion.comments && discussion.comments.length > 0 && (
                      <div className="space-y-2">
                        {discussion.comments.map((comment, idx) => (
                          <div key={idx} className="rounded-lg bg-white/5 p-3">
                            <p className="text-sm text-slate-300">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {user && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentData[discussion._id] || ''}
                          onChange={(e) => setCommentData({ ...commentData, [discussion._id]: e.target.value })}
                          placeholder="Add a comment..."
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddComment(discussion._id)}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionPage;
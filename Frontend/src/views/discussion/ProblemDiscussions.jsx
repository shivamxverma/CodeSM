import React, { useState, useEffect } from "react";
import {
    getAllDiscussion,
    createDiscussion,
    likeDiscussion,
    dislikeDiscussion,
    createComment,
} from "@/api/api";
import { useAuth } from "@/auth/AuthContext";

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    return `${Math.floor(diffInMonths / 12)}y ago`;
}

export default function ProblemDiscussions({ problemId }) {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list"); // 'list', 'create', 'view'
    const [activeDiscussion, setActiveDiscussion] = useState(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [comment, setComment] = useState("");

    const auth = useAuth();
    const user = auth?.user;

    useEffect(() => {
        if (problemId) {
            fetchDiscussions();
        }
    }, [problemId]);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const res = await getAllDiscussion(problemId);
            const fetched = res.data.data || res.data.message || res.data || [];
            setDiscussions(Array.isArray(fetched) ? fetched : []);
        } catch (err) {
            console.error("Error fetching discussions:", err);
            setDiscussions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDiscussion = async (e) => {
        e.preventDefault();
        try {
            await createDiscussion({ title, content, problem: problemId });
            setTitle("");
            setContent("");
            setView("list");
            fetchDiscussions();
        } catch (err) {
            console.error("Error creating discussion:", err);
        }
    };

    const handleCreateComment = async (e) => {
        e.preventDefault();
        if (!activeDiscussion || !comment.trim()) return;
        try {
            await createComment(activeDiscussion._id, { content: comment });
            setComment("");

            const res = await getAllDiscussion(problemId);
            const fetched = res.data.data || res.data.message || res.data || [];
            const updatedList = Array.isArray(fetched) ? fetched : [];
            setDiscussions(updatedList);

            const updatedActive = updatedList.find(d => d._id === activeDiscussion._id);
            if (updatedActive) setActiveDiscussion(updatedActive);
        } catch (err) {
            console.error("Error creating comment:", err);
        }
    };

    const handleLike = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await likeDiscussion(id);
            fetchDiscussions();
            if (activeDiscussion && activeDiscussion._id === id) {
                setActiveDiscussion(prev => ({ ...prev, like: (prev.like || 0) + 1 }));
            }
        } catch (err) {
            console.error("Error liking discussion:", err);
        }
    };

    const handleDislike = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await dislikeDiscussion(id);
            fetchDiscussions();
            if (activeDiscussion && activeDiscussion._id === id) {
                setActiveDiscussion(prev => ({ ...prev, dislike: (prev.dislike || 0) + 1 }));
            }
        } catch (err) {
            console.error("Error disliking discussion:", err);
        }
    };

    if (loading && view === "list") {
        return <div className="p-4 text-sm text-gray-400 flex items-center justify-center h-full">Loading discussions...</div>;
    }

    if (view === "create") {
        return (
            <div className="flex flex-col h-full animate-fade-in">
                <button onClick={() => setView("list")} className="text-left text-sm text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-1 w-fit">
                    &larr; Back to discussions
                </button>
                <form onSubmit={handleCreateDiscussion} className="space-y-4 flex flex-col flex-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2.5 bg-[#0c1219] border border-[#233046] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-sm text-gray-200"
                            placeholder="Discussion title..."
                        />
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                        <textarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full flex-1 p-2.5 bg-[#0c1219] border border-[#233046] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-sm text-gray-200 resize-none"
                            placeholder="What do you want to discuss?"
                        />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors mt-2">
                        Post Discussion
                    </button>
                </form>
            </div>
        );
    }

    if (view === "view" && activeDiscussion) {
        return (
            <div className="flex flex-col h-full animate-fade-in">
                <button onClick={() => { setView("list"); setActiveDiscussion(null); setComment(""); }} className="text-left text-sm text-blue-400 hover:text-blue-300 mb-3 inline-flex items-center gap-1 w-fit">
                    &larr; Back to list
                </button>

                <div className="flex-1 overflow-y-auto space-y-4 pb-4 custom-scrollbar pr-1">
                    <div className="bg-[#0c1219] p-4 rounded-lg border border-[#233046] shadow-sm">
                        <h2 className="text-lg font-bold text-gray-200 leading-snug">{activeDiscussion.title}</h2>
                        <div className="text-xs text-gray-400 mt-1 mb-3 flex items-center gap-2">
                            <span className="font-semibold text-blue-200">
                                {activeDiscussion.user?.username || activeDiscussion.user?.name || 'Unknown'}
                            </span>
                            <span>•</span>
                            <span>{timeAgo(activeDiscussion.createdAt)}</span>
                        </div>
                        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{activeDiscussion.content}</div>

                        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#1b2330]">
                            <button onClick={(e) => handleLike(activeDiscussion._id, e)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                                <span>{activeDiscussion.like || 0}</span>
                            </button>
                            <button onClick={(e) => handleDislike(activeDiscussion._id, e)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path></svg>
                                <span>{activeDiscussion.dislike || 0}</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-blue-300">Comments ({activeDiscussion.comments?.length || 0})</h3>

                        {activeDiscussion.comments?.length === 0 ? (
                            <div className="text-xs text-gray-500 italic px-1">No comments yet.</div>
                        ) : (
                            activeDiscussion.comments?.map((c, i) => (
                                <div key={i} className="bg-[#10151c] p-3 rounded-lg border border-[#233046]">
                                    <div className="text-xs text-blue-200 mb-1.5 font-medium">
                                        Anonymous
                                    </div>
                                    <div className="text-sm text-gray-300 leading-relaxed">{c.content?.content || c.content || c}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {user ? (
                    <form onSubmit={handleCreateComment} className="mt-3 flex gap-2 shrink-0">
                        <input
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="flex-1 p-2 bg-[#0c1219] border border-[#233046] focus:border-blue-500 focus:outline-none rounded-lg text-sm text-gray-200"
                            placeholder="Add a comment..."
                        />
                        <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                            Post
                        </button>
                    </form>
                ) : (
                    <div className="mt-3 text-sm text-gray-400 text-center shrink-0 border border-[#233046] bg-[#0c1219] p-2 rounded-lg">
                        Log in to comment
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {user ? (
                <button
                    onClick={() => setView("create")}
                    className="w-full mb-3 py-2 bg-[#1a2432] hover:bg-[#1f2c3e] border border-[#2a3750] text-blue-300 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Start a new discussion
                </button>
            ) : (
                <div className="w-full mb-3 py-2 bg-[#0c1219] border border-[#233046] text-gray-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shrink-0">
                    Log in to start a discussion
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1 custom-scrollbar">
                {discussions.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-10">No discussions for this problem yet. Be the first to start one!</div>
                ) : (
                    discussions.map(d => (
                        <div
                            key={d._id}
                            className="bg-[#0c1219] p-3.5 rounded-lg border border-[#233046] cursor-pointer hover:border-[#3a4f73] transition-colors shadow-sm"
                            onClick={() => { setActiveDiscussion(d); setView("view"); }}
                        >
                            <h3 className="font-semibold text-gray-200 text-base leading-tight mb-1">{d.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2 leading-snug">{d.content}</p>

                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 border-t border-[#1b2330] pt-2.5">
                                <span className="font-medium text-blue-200/70 truncate max-w-[100px]">{d.user?.username || d.user?.name || 'Unknown'}</span>
                                <span>•</span>
                                <span>{timeAgo(d.createdAt)}</span>
                                <span className="ml-auto flex items-center gap-1 bg-[#10151c] px-2 py-0.5 rounded border border-[#233046]">
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    {d.comments?.length || 0}
                                </span>
                                <span className="flex items-center gap-1 text-green-400/80">👍 {d.like || 0}</span>
                                <span className="flex items-center gap-1 text-red-400/80">👎 {d.dislike || 0}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

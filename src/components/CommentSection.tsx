import React, { useState } from "react";
import { Comment, UserProfile } from "../data/mockData";
import { Send, Image as ImageIcon, Smile, ThumbsUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface CommentSectionProps {
  comments: Comment[];
  userProfile: UserProfile;
  onAddComment: (text: string, media?: { type: 'gif' | 'image', url: string }) => void;
  onDeleteComment?: (commentId: string) => void;
}

const GIFS = [
  "https://media.giphy.com/media/l0HlO3BJ8LALPW4sE/giphy.gif", // Thumbs up
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", // Mind blown
  "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif", // Homer Simpson
  "https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif", // Success
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", // Confused
  "https://media.giphy.com/media/3o6UB3VhArvomJHtdK/giphy.gif", // Party
  "https://media.giphy.com/media/l2JIdnF6aJcNqnUfC/giphy.gif", // Cool
  "https://media.giphy.com/media/3o7TKSjRrfPHkIGulW/giphy.gif", // Laughing
  "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif", // Minions Laughing
  "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif", // Roll Safe (Smart)
  "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif", // Confused Travolta
  "https://media.giphy.com/media/l0IylOPCNkiqOgMyA/giphy.gif", // Pepe Silvia
  "https://media.giphy.com/media/3oKIPa2TdahY8LAAgw/giphy.gif", // Crying Jordan
  "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif", // Math Lady
  "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", // This is fine
  "https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif", // Salt Bae
  "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", // Grandma finding internet
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", // Confused Nick Young
  "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif", // Deal with it
  "https://media.giphy.com/media/3o7qDSOvfaCO9b3MlO/giphy.gif", // Mic Drop
  "https://media.giphy.com/media/l0HlHJGHe3yAMhdQY/giphy.gif", // Facepalm
  "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif", // Thinking
  "https://media.giphy.com/media/l0HlO3BJ8LALPW4sE/giphy.gif", // Thumbs Up (Duplicate removed in real app, keeping for list length)
  "https://media.giphy.com/media/xT4uQ7N8UNsoeFAjVS/giphy.gif", // Applause
  "https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif", // Excited
  "https://media.giphy.com/media/l0HlCqV35hdEg2PN6/giphy.gif", // No
  "https://media.giphy.com/media/3o7TKwmnDgQsTmetC8/giphy.gif", // Yes
  "https://media.giphy.com/media/l0HlO3BJ8LALPW4sE/giphy.gif", // Good Job
  "https://media.giphy.com/media/3o7TKSjRrfPHkIGulW/giphy.gif", // Funny
  "https://media.giphy.com/media/l0HlHJGHe3yAMhdQY/giphy.gif", // Oh no
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", // Wow
  "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif", // Homer
];

export function CommentSection({ comments, userProfile, onAddComment, onDeleteComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment("");
    setShowGifPicker(false);
  };

  const handleGifSelect = (url: string) => {
    onAddComment(newComment || "Sent a GIF", { type: 'gif', url });
    setNewComment("");
    setShowGifPicker(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        Comments <span className="text-gray-400 text-sm font-normal">({comments.length})</span>
      </h3>

      {/* Comment List */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
      >
        {comments.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div 
              key={comment.id} 
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex gap-4 group"
            >
              <div className="flex-shrink-0">
                <img 
                  src={`https://picsum.photos/seed/${comment.avatarSeed}/100/100`} 
                  alt={comment.username} 
                  className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{comment.username}</span>
                    <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                  </div>
                  {onDeleteComment && (userProfile.username === comment.username || userProfile.isAdmin) && (
                    <button 
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                
                {comment.media && (
                  <div className="mt-2 rounded-lg overflow-hidden max-w-xs border border-gray-100">
                    <img 
                      src={comment.media.url} 
                      alt="GIF" 
                      className="w-full h-auto object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    {comment.likes}
                  </button>
                  <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Input Area */}
      <div className="relative pt-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <img 
            src={`https://picsum.photos/seed/${userProfile.avatarSeed}/100/100`} 
            alt="You" 
            className="w-10 h-10 rounded-full bg-gray-100 object-cover hidden sm:block"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                type="button"
                onClick={() => setShowGifPicker(!showGifPicker)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showGifPicker ? "text-emerald-600 bg-emerald-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                )}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* GIF Picker Popover */}
            <AnimatePresence>
              {showGifPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-10"
                >
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-gray-500 uppercase">Select a GIF</span>
                    <button onClick={() => setShowGifPicker(false)} className="text-gray-400 hover:text-gray-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {GIFS.map((gif, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleGifSelect(gif)}
                        className="cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all aspect-video bg-gray-100"
                      >
                        <img src={gif} alt="GIF" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  );
}

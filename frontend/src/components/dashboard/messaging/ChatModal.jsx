import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatModal({ isOpen, onClose, recipient, currentUser, token }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen && recipient) {
            fetchMessages();
            // Optional: Set up an interval or socket here for real-time
            const interval = setInterval(fetchMessages, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [isOpen, recipient]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API_URL}/messages/${recipient._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data.data || []);
            setLoading(false);

            // Mark as Read
            await axios.put(`${API_URL}/messages/read`,
                { senderId: recipient._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Fetch Messages Error:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic UI Update
        const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;
        const optimisticMsg = {
            _id: Date.now(),
            sender: { _id: currentUserId, username: currentUser.username, avatar: currentUser.avatar },
            content: newMessage,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setSending(true);

        try {
            await axios.post(`${API_URL}/messages`,
                { recipientId: recipient._id, content: optimisticMsg.content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMessages(); // Sync with server for real ID/timestamp
        } catch (error) {
            console.error("Send Message Error:", error);
            toast.error("Message Failed to Send");
            // Remove optimistic message on fail
            setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0B0F19] border border-blue-500/30 rounded-2xl w-full max-w-2xl h-[70vh] flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.2)]"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#050510]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-blue-500/50">
                                <img src={recipient.avatar || 'https://github.com/github.png'} className="w-full h-full object-cover" alt="avatar" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{recipient.fullName || recipient.username}</h3>
                                <p className="text-blue-400 text-xs font-mono">ENCRYPTED UPLINK</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white p-2">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
                        {loading && messages.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <span className="text-blue-500 font-mono animate-pulse">ESTABLISHING LINK...</span>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-20 font-mono text-sm">
                                NO SIGNAL HISTORY.<br />INITIATE PROTOCOL.
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                // Fix: Robust ID Comparison
                                const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                                const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;
                                const isMe = senderId && currentUserId && String(senderId) === String(currentUserId);

                                // Grouping Logic
                                const prevMsg = messages[i - 1];
                                const nextMsg = messages[i + 1];
                                const isFirstInGroup = !prevMsg || (typeof prevMsg.sender === 'object' ? prevMsg.sender._id : prevMsg.sender) !== senderId;
                                const isLastInGroup = !nextMsg || (typeof nextMsg.sender === 'object' ? nextMsg.sender._id : nextMsg.sender) !== senderId;

                                return (
                                    <motion.div
                                        key={msg._id || i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isLastInGroup ? 'mb-4' : 'mb-1'}`}
                                    >
                                        {/* Avatar (Only show for last message in group for "Them", always hidden for "Me" or show for "Me" if preferred) */}
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-white/10 ${!isMe && isLastInGroup ? 'opacity-100' : 'opacity-0'}`}>
                                            {!isMe && <img src={recipient.avatar || 'https://github.com/github.png'} className="w-full h-full object-cover" alt="avatar" />}
                                        </div>

                                        <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2.5 text-sm font-sans leading-relaxed shadow-md backdrop-blur-md transition-all
                                                ${isMe
                                                    ? 'bg-blue-600/90 text-white shadow-blue-900/20'
                                                    : 'bg-[#1E293B]/80 text-gray-200 border border-white/5 shadow-black/20'
                                                }
                                                ${isMe
                                                    ? (isFirstInGroup && isLastInGroup ? 'rounded-2xl rounded-tr-sm' :
                                                        isFirstInGroup ? 'rounded-2xl rounded-tr-sm rounded-br-md' :
                                                            isLastInGroup ? 'rounded-2xl rounded-br-sm rounded-tr-md' : 'rounded-xl rounded-r-md')
                                                    : (isFirstInGroup && isLastInGroup ? 'rounded-2xl rounded-tl-sm' :
                                                        isFirstInGroup ? 'rounded-2xl rounded-tl-sm rounded-bl-md' :
                                                            isLastInGroup ? 'rounded-2xl rounded-bl-sm rounded-tl-md' : 'rounded-xl rounded-l-md')
                                                }
                                            `}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>

                                            {/* Timestamp (Only show for last in group) */}
                                            {isLastInGroup && (
                                                <span className={`text-[10px] text-slate-500 mt-1 px-1 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.isOptimistic && ' • sending...'}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#050510]">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Transmit message..."
                                className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-mono text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

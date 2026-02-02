import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatTerminal({ user, recipient, onClose, token }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    // Initial Load & Polling
    useEffect(() => {
        if (!recipient) return;
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [recipient]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_URL}/messages/${recipient._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data.data || []);
        } catch (e) {
            console.error("Fetch msg error:", e);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        setSending(true);
        try {
            const res = await axios.post(`${API_URL}/messages`,
                { recipientId: recipient._id, content: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistic Update
            setMessages(prev => [...prev, res.data.data]);
            setInput('');
        } catch (error) {
            console.error("Send error:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full bg-white/90 dark:bg-black/40 backdrop-blur-xl border-l border-gray-200 dark:border-white/10 relative overflow-hidden transition-colors"
        >
            {/* TERMINAL HEADER */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                    <span className="font-mono text-sm tracking-widest text-green-600 dark:text-green-400">
                        SECURE_UPLINK :: {recipient?.username}
                    </span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:text-slate-500 dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined font-bold">close</span>
                </button>
            </div>

            {/* SCANLINE OVERLAY */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10 z-0" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/10 dark:bg-green-500/20 blur-[1px] animate-scanline pointer-events-none z-0" />

            {/* MESSAGES AREA */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar z-10 relative">
                {messages.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="font-mono text-xs text-green-600/70 dark:text-green-500/70">
                            &gt; CONNECTION ESTABLISHED<br />
                            &gt; AWAITING DATA PACKETS...
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    // Fix: Handle populated sender object or string ID
                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                    const isMe = senderId === user?._id;
                    const showAvatar = idx === 0 || messages[idx - 1]?.sender?._id !== senderId;

                    return (
                        <div key={idx} className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 ${!showAvatar ? 'opacity-0' : ''}`}>
                                {isMe ? (
                                    <img src={user?.avatar || "https://github.com/github.png"} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={recipient?.avatar || "https://github.com/github.png"} alt="Them" className="w-full h-full object-cover" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl relative text-sm font-sans leading-relaxed shadow-lg
                                    ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20 dark:shadow-blue-900/20'
                                        : 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-slate-200 rounded-tl-none border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-black/20'
                                    }`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {sending && (
                    <div className="flex justify-end">
                        <span className="text-xs font-mono text-slate-500 animate-pulse">TRANSMITTING...</span>
                    </div>
                )}
                {/* Simulated Typing Indicator (Mock) */}
                {!sending && messages.length > 0 && Math.random() > 0.7 && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 px-3 py-2 rounded-lg rounded-bl-none border border-white/10 flex gap-1 items-center">
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 z-10 relative transition-colors">
                <div className="relative flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-500 font-mono text-lg">{'>'}</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="ENTER MESSAGE PROTOCOL..."
                        className="w-full bg-transparent border-none text-sm text-gray-900 dark:text-green-400 font-mono placeholder:text-gray-400 dark:placeholder:text-green-900 focus:ring-0"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="text-gray-400 hover:text-green-600 dark:text-slate-500 dark:hover:text-green-400 disabled:opacity-30 transition-colors"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

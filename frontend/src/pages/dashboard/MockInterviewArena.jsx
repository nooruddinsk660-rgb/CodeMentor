import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Sidebar from "../../components/dashboard/Sidebar";

export default function MockInterviewArena() {
    const [status, setStatus] = useState('idle'); // idle, active, evaluating, outcome
    const [conversation, setConversation] = useState([]);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [code, setCode] = useState("// Write your solution here...");
    const [xpEarned, setXpEarned] = useState(0);
    const [editorTheme, setEditorTheme] = useState('vs-dark'); // [NEW]

    // Audio Visualizer Refs
    const canvasRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Theme Detection
    useEffect(() => {
        const updateTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setEditorTheme(isDark ? 'vs-dark' : 'light');
        };
        updateTheme(); // Initial check

        // Observer for class changes on html
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Initial Greeting
    useEffect(() => {
        if (status === 'idle') {
            // Optional: Auto-greet?
        }
    }, []);

    const startInterview = async () => {
        setStatus('active');
        setXpEarned(0);
        addMessage('ai', "Initializing Neural Link... Accessing Archives...");

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/interview/generate`,
                { difficulty: 'medium', topic: 'dsa' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiData = res.data;
            const q = aiData.question;

            // Simulated realistic delay for "scanning"
            setTimeout(() => {
                setCurrentProblem({
                    title: q.title,
                    description: q.description,
                    difficulty: 'Medium',
                    xp: 50 // UI Estimate
                });
                setCode(q.template);
                addMessage('ai', aiData.message);
                speak(aiData.message);
            }, 1000);

        } catch (e) {
            console.error("Interview Start Error", e);
            const errorMsg = "⚠️ Connection disrupted. Running local simulation protocol.";
            addMessage('ai', errorMsg);
            speak("Connection disrupted. Running local simulation protocol.");

            // Fail-safe manual problem load
            setCurrentProblem({
                title: "Two Sum",
                description: "Find indices of two numbers that add up to target.",
                difficulty: "Medium",
                xp: 100
            });
        }
    };

    const handleNextQuestion = () => {
        setConversation([]); // Optional: Clear chat or keep history?
        startInterview();
    };

    const handleChat = async (text) => {
        addMessage('user', text);
        try {
            const token = localStorage.getItem('token');

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/interview/chat`,
                { message: text, context: currentProblem?.title },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const reply = res.data.reply;
            addMessage('ai', reply);
            speak(reply);

        } catch (error) {
            // Fallback for demo if backend fails
            const fallback = "I am processing your input. (Backend connection unstable)";
            addMessage('ai', fallback);
            speak(fallback);
        }
    };

    const submitCode = async () => {
        setStatus('evaluating');
        addMessage('system', "Compiling and Analyzing...");

        try {
            const token = localStorage.getItem('token');
            // Ensure questionId is passed if available, else derive or omit
            const qId = currentProblem?.id || 'm1'; // Default fallback if id not mapped yet

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/interview/evaluate`,
                {
                    code,
                    language: 'python',
                    questionId: qId,
                    difficulty: currentProblem?.difficulty || 'medium'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const result = res.data;
            const feedback = result.feedback || "Analysis received.";
            const isCorrect = result.status === 'accepted';

            setTimeout(() => {
                setStatus('outcome');
                addMessage('ai', feedback);
                speak(feedback);

                if (isCorrect) {
                    setXpEarned(result.xpEarned || 30);
                    const successMsg = `Protocol Complete. +${result.xpEarned || 30} XP Earned. Ready for next challenge?`;
                    addMessage('system', successMsg);
                    speak("Protocol Complete. XP Awarded.");
                }
            }, 1000);

        } catch (e) {
            setStatus('active'); // Returning to active allows retry
            const errMsg = e.response?.data?.error || e.message;
            addMessage('system', "Evaluation Failed: " + errMsg);
            speak("System Error. Please check console.");
        }
    };

    const addMessage = (sender, text) => {
        setConversation(prev => [...prev, { sender, text }]);
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            utterance.pitch = 1.0; // Natural pitch
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#030712] font-sans text-gray-900 dark:text-slate-200 overflow-hidden transition-colors duration-300">
            <Sidebar />

            <main className="flex-1 flex flex-col relative">
                {/* --- Header --- */}
                <header className="h-16 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19] flex items-center justify-between px-6 z-20 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500 animate-pulse">emergency_home</span>
                        <h1 className="font-black text-xl tracking-widest text-red-500">INTERVIEW ARENA // PROTOCOL: DSA</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400 font-mono">
                            LIVE SESSION
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">

                    {/* --- Left Panel: AI & Chat --- */}
                    <div className="w-1/3 border-r border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#050810] flex flex-col relative transition-colors">

                        {/* Sentinel Visualizer */}
                        <div className="h-64 border-b border-gray-200 dark:border-white/5 relative flex items-center justify-center bg-gray-200/50 dark:bg-black/40 transition-colors">
                            <div className={`w-32 h-32 rounded-full border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)] transition-all ${isSpeaking ? 'scale-110 shadow-[0_0_80px_rgba(239,68,68,0.6)]' : 'scale-100'}`}>
                                <div className="w-24 h-24 rounded-full bg-red-500/20 animate-pulse flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-red-500">smart_toy</span>
                                </div>
                            </div>
                            <div className="absolute bottom-4 text-xs text-red-400 font-mono tracking-[0.2em] opacity-80">
                                AI // NOOR
                            </div>
                            {/* Sound Waves (Mock) */}
                            {isSpeaking && (
                                <div className="absolute inset-0 flex items-center justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [10, 40, 10] }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                            className="w-1 bg-red-500/50"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {conversation.length === 0 && status === 'idle' && (
                                <div className="text-center mt-10">
                                    <button
                                        onClick={startInterview}
                                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-95"
                                    >
                                        INITIATE SEQUENCE
                                    </button>
                                </div>
                            )}

                            {conversation.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                                        : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-300 rounded-tl-none font-mono shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#0B0F19] transition-colors">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Interrogate Noor or ask for Hints..."
                                    className="flex-1 bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-red-500/50 focus:outline-none placeholder-gray-500 dark:placeholder-gray-600 transition-colors"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value) {
                                            handleChat(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">mic</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* --- Right Panel: Code Editor --- */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] transition-colors">
                        {currentProblem && (
                            <div className="p-4 bg-gray-50 dark:bg-[#0B0F19] border-b border-gray-200 dark:border-white/5 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{currentProblem.title}</h2>
                                    <span className="text-xs font-mono text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                                        SOLUTION_TERMINAL // PYTHON
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{currentProblem.description}</p>
                            </div>
                        )}

                        <div className="flex-1 relative min-h-0">
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme={editorTheme} // [UPDATED]
                                value={code}
                                onChange={(val) => setCode(val)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    padding: { top: 20 },
                                    automaticLayout: true
                                }}
                            />
                        </div>

                        <div className="h-16 border-t border-gray-200 dark:border-green-500/20 bg-white dark:bg-[#0B0F19] flex items-center justify-end px-6 gap-4 z-50 shrink-0 transition-colors">
                            {status === 'outcome' ? (
                                <div className="flex items-center gap-4">
                                    <div className="text-green-400 font-mono text-sm">
                                        MISSION ACCOMPLISHED // +{xpEarned} XP
                                    </div>
                                    <button
                                        onClick={handleNextQuestion}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    >
                                        <span className="material-symbols-outlined">fast_forward</span>
                                        NEXT CHALLENGE
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={submitCode}
                                    disabled={status === 'outcome'}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                                >
                                    <span className="material-symbols-outlined">play_circle</span>
                                    {status === 'evaluating' ? 'ANALYZING...' : 'EXECUTE & ANALYZE'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>

    );
}

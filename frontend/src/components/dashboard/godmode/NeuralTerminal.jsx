import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_LOGS = [
    "encrypting neural packets...",
    "node #8492 handshake established",
    "latency: 12ms // secure",
    "analyzing github graph...",
    "vector_db: query optimized",
    "syncing repositories...",
    "detected anomalous coding patterns",
    "buffer_overflow prevented",
    "dev_os kernel update: pending",
    "uplink stable",
    "scanning sector 7G...",
    "identity obfuscation: active"
];

export default function NeuralTerminal({ onCommand, isOpen }) {
    const [logs, setLogs] = useState([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs, isOpen]);

    // System heartbeat (random logs)
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const randomLog = MOCK_LOGS[Math.floor(Math.random() * MOCK_LOGS.length)];
                const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
                addLog(`[${timestamp}] REV:: ${randomLog}`, 'system');
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isOpen]);

    const addLog = (text, type = 'info') => {
        setLogs(prev => [...prev.slice(-50), { id: Date.now() + Math.random(), text, type }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim();
        addLog(`> ${cmd}`, 'command');

        // Process internal commands or pass to parent
        if (cmd === '/clear') {
            setLogs([]);
        } else if (cmd === '/help') {
            addLog("COMMAND LIST: /scan, /clear, /ghost, /connect <user>", "success");
        } else {
            if (onCommand) onCommand(cmd);
        }

        setInput('');
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-64 right-0 h-48 bg-[#050510]/95 border-t border-purple-500/30 backdrop-blur-md z-40 flex flex-col font-mono text-xs shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
        >
            {/* Terminal Header */}
            <div className="bg-purple-900/10 px-4 py-1 border-b border-purple-500/20 flex justify-between items-center text-purple-400">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    <span>NEURAL_CLI_V2.0 // ROOT_ACCESS</span>
                </div>
                <div className="flex gap-4">
                    <span>CPU: {Math.floor(Math.random() * 20 + 10)}%</span>
                    <span>MEM: 128MB</span>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                {logs.map(log => (
                    <div key={log.id} className={`${log.type === 'command' ? 'text-white font-bold' :
                            log.type === 'success' ? 'text-green-400' :
                                log.type === 'error' ? 'text-red-400' :
                                    'text-purple-300/60'
                        }`}>
                        {log.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-2 border-t border-purple-500/20 bg-black/20 flex gap-2">
                <span className="text-green-400 font-bold">&gt;</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-400/30"
                    placeholder="Enter command (try /scan or /help)..."
                    autoFocus
                />
            </form>
        </motion.div>
    );
}

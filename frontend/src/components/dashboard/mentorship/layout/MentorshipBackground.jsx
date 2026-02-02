import React from 'react';

export default function MentorshipBackground() {
    return (
        <>
            {/* Background Grid + CRT Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 dark:opacity-20 pointer-events-none" />
            <div className="absolute inset-0 crt-overlay pointer-events-none z-50 opacity-40" />
        </>
    );
}

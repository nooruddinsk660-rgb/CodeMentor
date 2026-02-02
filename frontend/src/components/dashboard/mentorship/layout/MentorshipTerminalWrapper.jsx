import React from 'react';
import { AnimatePresence } from 'framer-motion';
import NeuralTerminal from "../../godmode/NeuralTerminal";

export default function MentorshipTerminalWrapper({ showTerminal, onCommand }) {
    return (
        <AnimatePresence>
            {showTerminal && (
                <NeuralTerminal
                    isOpen={showTerminal}
                    onCommand={onCommand}
                />
            )}
        </AnimatePresence>
    );
}

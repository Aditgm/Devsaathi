"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiRoastPanelProps {
    roastText?: string;
    isCPMode?: boolean;
}

export function AiRoastPanel({ roastText = "Scanning your repositories... Did you really copy-paste this React code from a 2018 Medium article? Your commit history explains why recruiters aren't calling back.", isCPMode = false }: AiRoastPanelProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let i = 0;
        setIsTyping(true);
        setDisplayedText("");


        const interval = setInterval(() => {
            setDisplayedText(roastText.slice(0, i));
            i++;
            if (i > roastText.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 30); // 30ms per character

        return () => clearInterval(interval);
    }, [roastText]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`relative col-span-1 rounded-2xl ${isCPMode ? 'bg-gradient-to-br from-[#0e1a2a] to-[#0b121a] border-blue-500/20' : 'bg-gradient-to-br from-[#2a0e0e] to-[#1a0b0b] border-orange-500/20'} border p-6 overflow-hidden flex flex-col justify-between`}
        >
            <div className={`absolute -top-10 -right-10 w-40 h-40 ${isCPMode ? 'bg-blue-500/20' : 'bg-orange-500/20'} blur-[60px] rounded-full`} data-html2canvas-ignore="true" />

            <div className="flex justify-between items-start z-10 w-full mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 ${isCPMode ? 'bg-blue-500/20' : 'bg-orange-500/20'} rounded-lg`}>
                        <Flame className={`w-5 h-5 ${isCPMode ? 'text-blue-400' : 'text-orange-500'}`} />
                    </div>
                    <h2 className={`text-xl font-bold font-mono tracking-tight ${isCPMode ? 'text-blue-50' : 'text-orange-50'}`}>AI Roast</h2>
                </div>
                <Button variant="ghost" size="icon" className={`hover:bg-white/10 ${isCPMode ? 'text-blue-200' : 'text-orange-200'}`} title="Share your roast">
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="z-10 w-full space-y-4 mt-2">
                <div className="min-h-[120px]">
                    <p className={`text-lg leading-relaxed ${isCPMode ? 'text-blue-100/90' : 'text-orange-100/90'} font-medium`}>
                        "{displayedText}"
                        {isCPMode && isTyping && <span className="inline-block w-2.5 h-6 ml-1 bg-blue-500 animate-pulse align-middle" />}
                        {!isCPMode && isTyping && <span className="inline-block w-2.5 h-6 ml-1 bg-orange-500 animate-pulse align-middle" />}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

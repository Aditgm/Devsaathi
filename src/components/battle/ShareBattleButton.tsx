"use client";

import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { useState } from "react";

export function ShareBattleButton({ user1, user2, mode }: { user1: string; user2: string; mode: "github" | "cp" }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleShare = async () => {
        setIsGenerating(true);
        try {
            const element = document.getElementById("battle-result-card");
            if (!element) return;

            const canvas = await html2canvas(element, {
                backgroundColor: "#000000",
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `${user1}-vs-${user2}-${mode}-battle.png`;
            link.click();
        } catch (error) {
            console.error("Failed to generate battle card:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex justify-center mt-10">
            <Button
                onClick={handleShare}
                disabled={isGenerating}
                className="gap-3 px-8 py-6 text-lg font-bold bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white border-0 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] transition-all duration-300"
                size="lg"
            >
                {isGenerating ? (
                    <>
                        <Download className="w-5 h-5 animate-bounce" />
                        Generating Battle Card...
                    </>
                ) : (
                    <>
                        <Share2 className="w-5 h-5" />
                        Share Battle Result
                    </>
                )}
            </Button>
        </div>
    );
}

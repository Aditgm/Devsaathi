"use client";

import { Share2, Briefcase, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { useState } from "react";

export function ActionPanel({ username }: { username: string }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleShare = async () => {
        setIsGenerating(true);
        try {

            const element = document.getElementById("devsaathi-dashboard");
            if (!element) return;

            const canvas = await html2canvas(element, {
                backgroundColor: "#000000",
                scale: 2, // Higher quality
                logging: false,
                useCORS: true, // Allow external avatars to load
            });


            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `${username}-devsaathi-card.png`;
            link.click();
        } catch (error) {
            console.error("Failed to generate shareable card:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="rounded-2xl bg-zinc-950/50 border border-white/5 p-6 backdrop-blur-xl flex flex-col gap-3 relative overflow-hidden h-full justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 pointer-events-none" />

            <Button
                onClick={handleShare}
                disabled={isGenerating}
                className="w-full justify-start gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10"
                variant="outline"
                size="lg"
            >
                <Share2 className="w-4 h-4 text-zinc-400" />
                {isGenerating ? "Generating Card..." : "Share Card"}
            </Button>
            <Button className="w-full justify-start gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10" variant="outline" size="lg">
                <Briefcase className="w-4 h-4 text-blue-400" />
                Get FAANG Roadmap
            </Button>
            <Button className="w-full justify-start gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10" variant="outline" size="lg">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                Generate Resume Bullets
            </Button>
        </div>
    );
}

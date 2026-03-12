"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flame, Github, Terminal, Code2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "github" | "cp";
type CPPlatform = "leetcode" | "codeforces";

export default function Home() {
  const [username, setUsername] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<Mode>("github");
  const [cpPlatform, setCpPlatform] = useState<CPPlatform>("leetcode");
  const [isBattleMode, setIsBattleMode] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || (isBattleMode && !player2.trim())) return;
    setIsScanning(true);

    setTimeout(() => {
      if (mode === "github") {
        if (isBattleMode) {
          router.push(`/battle/github/${username}/${player2}`);
        } else {
          router.push(`/profile/${username}`);
        }
      } else {
        if (cpPlatform === "codeforces") {
          router.push(`/cf/${username}`);
        } else if (isBattleMode) {
          router.push(`/battle/cp/${username}/${player2}`);
        } else {
          router.push(`/cp/${username}`);
        }
      }
    }, 1500);
  };

  const isGitHub = mode === "github";
  const isCF = !isGitHub && cpPlatform === "codeforces";
  const accentColor = isGitHub ? "from-purple-500 to-orange-500" : isCF ? "from-orange-500 to-red-500" : "from-blue-500 to-cyan-500";
  const glowColor = isGitHub ? "bg-purple-900/20" : isCF ? "bg-orange-900/20" : "bg-blue-900/20";
  const tagColor = isGitHub ? "text-purple-300" : isCF ? "text-orange-300" : "text-blue-300";
  const tagIcon = isGitHub ? <Flame className="w-4 h-4 text-orange-500" /> : <Zap className="w-4 h-4 text-cyan-400" />;

  const placeholderText = isGitHub
    ? (isBattleMode ? "Player 1 GitHub..." : "Enter GitHub username...")
    : isCF
      ? "Enter Codeforces handle..."
      : (isBattleMode ? "Player 1 LeetCode..." : "Enter LeetCode username...");

  const tagLabel = isGitHub ? "The Ultimate GitHub Roaster" : isCF ? "The Ultimate Codeforces Roaster" : "The Ultimate LeetCode Roaster";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className={`absolute top-0 w-full h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-700 ${glowColor}`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center space-y-8"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-20 mb-2">
          {/* Mode Toggle (GitHub/CP) */}
          <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl w-fit border border-white/10 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => { setMode("github"); setUsername(""); setPlayer2(""); setIsScanning(false); }}
              className={`relative px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${isGitHub ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {isGitHub && (
                <motion.div layoutId="mode-bg" className="absolute inset-0 bg-white/10 rounded-xl border border-white/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub Mode</span>
            </button>

            <button
              onClick={() => { setMode("cp"); setUsername(""); setPlayer2(""); setIsScanning(false); }}
              className={`relative px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${!isGitHub ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {!isGitHub && (
                <motion.div layoutId="mode-bg" className="absolute inset-0 bg-white/10 rounded-xl border border-white/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10 flex items-center gap-2"><Code2 className="w-4 h-4" /> CP Mode</span>
            </button>
          </div>

          {/* Battle Mode Toggle */}
          <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl w-fit border border-white/10 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setIsBattleMode(!isBattleMode)}
              className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${isBattleMode ? "text-red-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {isBattleMode && (
                <motion.div layoutId="battle-bg" className="absolute inset-0 bg-red-500/10 rounded-xl border border-red-500/20" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10 flex items-center gap-2">⚔️ 1v1 Battle Mode</span>
            </button>
          </div>
        </div>

        {/* CP Platform Sub-toggle */}
        <AnimatePresence>
          {!isGitHub && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex bg-zinc-900/60 p-1 rounded-xl border border-white/10 w-fit"
            >
              <button
                onClick={() => { setCpPlatform("leetcode"); setUsername(""); setIsScanning(false); }}
                className={`relative px-5 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${cpPlatform === "leetcode" ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {cpPlatform === "leetcode" && (
                  <motion.div layoutId="cp-platform-bg" className="absolute inset-0 bg-cyan-500/10 rounded-lg border border-cyan-500/20" />
                )}
                <span className="relative z-10">⚡ LeetCode</span>
              </button>
              <button
                onClick={() => { setCpPlatform("codeforces"); setUsername(""); setIsBattleMode(false); setIsScanning(false); }}
                className={`relative px-5 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${cpPlatform === "codeforces" ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {cpPlatform === "codeforces" && (
                  <motion.div layoutId="cp-platform-bg" className="absolute inset-0 bg-orange-500/10 rounded-lg border border-orange-500/20" />
                )}
                <span className="relative z-10">🏆 Codeforces</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium transition-colors duration-500 ${tagColor}`}>
          {tagIcon}
          <span>{tagLabel}</span>
        </div>

        <div className="space-y-4 h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + cpPlatform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                Dev<span className={`text-transparent bg-clip-text bg-gradient-to-r transition-colors duration-500 ${isGitHub ? "from-purple-400 to-orange-400" : isCF ? "from-orange-400 to-red-400" : "from-blue-400 to-cyan-400"}`}>Saathi</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto">
                {isGitHub
                  ? "Get your GitHub profile brutally roasted, scored for FAANG, and optimized in seconds."
                  : isCF
                    ? "Get your Codeforces profile dissected, your rating mocked, and your algorithm skills ranked."
                    : "Get your LeetCode stats destroyed, FAANG readiness evaluated, and your algorithms mocked."
                }
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="w-full max-w-xl mt-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <form onSubmit={handleSearch} className="relative group flex flex-col gap-4">
            <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500 bg-gradient-to-r ${isBattleMode ? "from-red-500 to-orange-500" : accentColor}`}></div>

            <div className="relative flex flex-col md:flex-row items-center gap-2 bg-zinc-950 border border-white/10 rounded-xl overflow-hidden p-2 shadow-2xl">
              <div className="relative flex-1 w-full flex items-center">
                {isGitHub ? <Github className="absolute left-4 w-5 h-5 text-zinc-400" /> : <Code2 className="absolute left-4 w-5 h-5 text-zinc-400" />}
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={placeholderText}
                  className="w-full bg-transparent border-none text-lg px-12 py-6 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-600 outline-none"
                  disabled={isScanning}
                />
              </div>

              {isBattleMode && !isCF && (
                <>
                  <div className="hidden md:flex w-px h-8 bg-white/10" />
                  <div className="relative flex-1 w-full flex items-center border-t md:border-t-0 border-white/10">
                    <span className="absolute left-4 text-xs font-bold text-red-500 tracking-widest">VS</span>
                    <Input
                      value={player2}
                      onChange={(e) => setPlayer2(e.target.value)}
                      placeholder={isGitHub ? "Player 2 GitHub..." : "Player 2 LeetCode..."}
                      className="w-full bg-transparent border-none text-lg px-12 py-6 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-600 outline-none"
                      disabled={isScanning}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={!username.trim() || (isBattleMode && !isCF && !player2.trim()) || isScanning}
                className={`text-black hover:bg-zinc-200 rounded-lg px-8 font-semibold transition-all md:ml-2 w-full md:w-auto ${isBattleMode && !isCF ? "bg-red-400 hover:bg-red-300 shadow-[0_0_20px_rgba(248,113,113,0.3)]" : isCF ? "bg-orange-400 hover:bg-orange-300 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"}`}
              >
                {isScanning ? (
                  <Terminal className="w-5 h-5 animate-pulse" />
                ) : (
                  isBattleMode && !isCF ? "FIGHT" : "Roast Me"
                )}
              </Button>
            </div>
          </form>

          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-6 flex flex-col items-center gap-2 text-sm font-mono ${isGitHub ? "text-purple-400" : isCF ? "text-orange-400" : "text-blue-400"}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-ping ${isGitHub ? "bg-purple-500" : isCF ? "bg-orange-500" : "bg-blue-500"}`} />
                <span>{isGitHub ? "Scanning Commits..." : isCF ? "Scanning Codeforces..." : "Scanning Submissions..."}</span>
              </div>
              <p className="text-zinc-500">Preparing brutal honesty protocol v4.0</p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-zinc-400 text-sm w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 transition-colors hover:bg-white/[0.04]">
            <Flame className={`w-5 h-5 ${isGitHub ? "text-orange-400" : isCF ? "text-orange-400" : "text-blue-400"}`} />
            <span className="font-medium text-zinc-300">AI Roast</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 transition-colors hover:bg-white/[0.04]">
            <Search className={`w-5 h-5 ${isGitHub ? "text-purple-400" : isCF ? "text-orange-400" : "text-cyan-400"}`} />
            <span className="font-medium text-zinc-300">FAANG Score</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 transition-colors hover:bg-white/[0.04]">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="font-medium text-zinc-300">{isGitHub ? "Activity Stats" : isCF ? "Rating Chart" : "Contest Rating"}</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 transition-colors hover:bg-white/[0.04]">
            {isGitHub ? <Github className="w-5 h-5 text-blue-400" /> : <Code2 className={`w-5 h-5 ${isCF ? "text-orange-400" : "text-purple-400"}`} />}
            <span className="font-medium text-zinc-300">{isGitHub ? "Repo Fixer" : isCF ? "Problem Stats" : "Pattern Analyzer"}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

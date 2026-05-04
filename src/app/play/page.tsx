"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sword, Swords, Heart, Clock, ArrowLeft, Star, Trophy, Unlock, Lock, Box, SpellCheck, CheckCircle2, XCircle, Award, Medal, Crown, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { getBadgeInfo } from "@/lib/badges";
import { SQUAD_PUTRA, SQUAD_PUTRI, WEAPONS } from "@/lib/constants";

// ---------------- DEFAULT GAME DATA (Fallback) ----------------
const defaultLevels = [
  { id: 1, title: "Pengetahuan Kepramukaan Dasar", type: "Adventure", points: 100 },
];

const defaultQuestions = [
  { type: 'QUIZ', question: "Siapakah Bapak Pramuka Indonesia?", options: ["Soekarno", "Sri Sultan Hamengkubuwono IX", "Ki Hajar Dewantara", "Baden Powell"], answer: 1 },
];

export default function PlayGame() {
  const [gameState, setGameState] = useState<'SETUP' | 'MAP' | 'BRIEFING' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('SETUP');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);
  const [score, setScore] = useState(0);

  // User Profile
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    squadType: 'Putra' as 'Putra' | 'Putri',
    squad: SQUAD_PUTRA[0],
    weapon: WEAPONS[0]
  });

  // Gameplay States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hp, setHp] = useState(100);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [textInput, setTextInput] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Special States for Matching Pairs
  const [memoryCards, setMemoryCards] = useState<{id: number, text: string, isMatched: boolean}[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  // DB Levels
  const [dbLevels, setDbLevels] = useState<any[]>([]);

  // 1. AUDIO PRELOADER (Runs once on mount to bypass mobile restrictions)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (!win.sfxMap) win.sfxMap = {};
      
      const loadSfx = (type: string, src: string, loop = false) => {
        if (!win.sfxMap[type]) {
          const a = new Audio(src);
          a.loop = loop;
          a.preload = 'auto'; // Force browser to buffer
          win.sfxMap[type] = a;
        }
      };

      loadSfx('start', 'https://cdn.freesound.org/previews/600/600130_13506646-lq.mp3');
      loadSfx('correct', 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3');
      loadSfx('wrong', 'https://cdn.freesound.org/previews/142/142608_1840739-lq.mp3');
      loadSfx('gameover', 'https://cdn.freesound.org/previews/173/173859_2375818-lq.mp3');
      loadSfx('flip', 'https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3');
      // Energetic BGM Loop
      loadSfx('bgm', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', true);
      // Long Epic Champions Music for Victory
      loadSfx('victory', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', true); 
    }
  }, []);

  // 2. AUDIO UNLOCKER (Triggered on first user interaction)
  const unlockAudio = () => {
    if (typeof window === 'undefined') return;
    const win = window as any;
    if (win.audioUnlocked) return;
    win.audioUnlocked = true;
    
    // Play and immediately pause all sounds silently to unlock Web Audio API on iOS/Mobile
    for (const key in win.sfxMap) {
      const a = win.sfxMap[key];
      a.volume = 0; 
      const p = a.play();
      if (p !== undefined) {
        p.then(() => {
          a.pause();
          a.currentTime = 0;
        }).catch(() => {});
      }
    }
  };

  // Sound Effects Caching Controller
  const playSound = (type: 'start' | 'correct' | 'wrong' | 'victory' | 'gameover' | 'flip' | 'bgm', action: 'play' | 'pause' = 'play') => {
    if (typeof window === 'undefined') return;
    const win = window as any;
    const el = win.sfxMap?.[type];
    if (!el) return;

    if (action === 'pause') {
      el.pause();
    } else {
      if (type !== 'bgm' && type !== 'victory') el.currentTime = 0;
      el.volume = (type === 'bgm' || type === 'victory') ? 0.6 : 1.0;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch((e:any) => console.log(`Audio prevented (${type}):`, e));
      }
    }
  };

  useEffect(() => {
    fetch('/api/admin/games')
      .then(res => res.json())
      .then(data => {
        if (data.levels && data.levels.length > 0) {
          setDbLevels(data.levels);
        }
      })
      .catch(e => console.log("Failed to fetch games", e));
  }, []);



  const getCurrentLevelInfo = () => {
    return (dbLevels.length > 0 ? dbLevels : defaultLevels).find(l => (l.levelNumber || l.id) === selectedLevel) || defaultLevels[0];
  };

  const getActiveQuestions = () => {
    const currentLevelInfo = getCurrentLevelInfo();
    if (currentLevelInfo && currentLevelInfo.questions && currentLevelInfo.questions.length > 0) {
      return currentLevelInfo.questions;
    }
    return defaultQuestions;
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0 && selectedAnswer === null && isAnswerCorrect === null) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && selectedAnswer === null && isAnswerCorrect === null) {
      handleAnswerTimeout();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, selectedAnswer, isAnswerCorrect]);

  // Setup Memory Cards if type changes
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const q = getActiveQuestions()[currentQuestion];
      if (q && q.type === 'MATCHING_PAIRS') {
        const pairedWords = [...q.options, ...q.options]; // Duplicate to make pairs
        const shuffled = pairedWords.sort(() => Math.random() - 0.5).map((text, i) => ({ id: i, text, isMatched: false }));
        setMemoryCards(shuffled);
        setFlippedCards([]);
      }
    }
  }, [currentQuestion, gameState]);

  // Handle Memory Card Logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (memoryCards[first].text === memoryCards[second].text) {
        // Match!
        playSound('correct');
        const newCards = [...memoryCards];
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setMemoryCards(newCards);
        setFlippedCards([]);
        
        // Check if all matched
        if (newCards.every(c => c.isMatched)) {
          processResult(true, null);
        }
      } else {
        // No match
        playSound('wrong');
        setHp(prev => Math.max(0, prev - 10)); // Tiny penalty for wrong card flip
        if (hp - 10 <= 0) processResult(false, null);
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  }, [flippedCards]);

  const startGame = (levelId: number) => {
    unlockAudio(); // Unlock audio context on very first user click
    playSound('start');
    setSelectedLevel(levelId);
    setGameState('BRIEFING');
  };

  const startLevel = () => {
    playSound('start');
    playSound('bgm', 'play');
    setCurrentQuestion(0);
    setHp(100);
    
    const firstQ = getActiveQuestions()[0];
    setTimeLeft(firstQ?.duration || 15);
    
    setSelectedAnswer(null);
    setTextInput("");
    setIsAnswerCorrect(null);
    setGameState('PLAYING');
  };

  const handleAnswerTimeout = () => {
    processResult(false, null);
  };

  const handleQuizAnswer = (answer: any) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const questions = getActiveQuestions();
    const correct = answer === questions[currentQuestion].answer;
    processResult(correct, answer);
  };

  const handleTextAnswer = () => {
    if (isAnswerCorrect !== null) return;
    const questions = getActiveQuestions();
    const correct = textInput.toUpperCase().trim() === String(questions[currentQuestion].answer).toUpperCase().trim();
    processResult(correct, -1);
  };

  const processResult = (correct: boolean, ansIndex: any) => {
    setIsAnswerCorrect(correct);
    playSound(correct ? 'correct' : 'wrong');

    if (correct) {
      setScore(prev => prev + 50 + (timeLeft * 2));
    } else {
      setHp(0); // Any mistake drops HP to 0 instantly for instant fail!
    }

    setTimeout(async () => {
      if (!correct) {
        playSound('bgm', 'pause');
        playSound('gameover');
        setUnlockedLevels(1); // RESET TO LEVEL 1 (Rogue-like mechanic)
        setGameState('GAMEOVER');
      } else if (currentQuestion < getActiveQuestions().length - 1) {
        const nextQ = getActiveQuestions()[currentQuestion + 1];
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(nextQ?.duration || 15);
        setSelectedAnswer(null);
        setTextInput("");
        setIsAnswerCorrect(null);
      } else {
        playSound('bgm', 'pause');
        playSound('victory', 'play');
        const activeLevels = dbLevels.length > 0 ? dbLevels : defaultLevels;
        
        // Save to DB
        try {
          await fetch('/api/mission/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: userProfile.fullName,
              squadName: userProfile.squad.name,
              squadType: userProfile.squadType,
              weaponName: userProfile.weapon.name,
              levelNumber: selectedLevel,
              score: score + 50 + (timeLeft * 2)
            })
          });
        } catch (e) {
          console.error("Failed to save progress", e);
        }

        if (selectedLevel === unlockedLevels && unlockedLevels < activeLevels.length) {
          setUnlockedLevels(prev => prev + 1);
        }
        setGameState('VICTORY');
      }
    }, 2000);
  };

  const quitToMap = () => {
    playSound('bgm', 'pause');
    setGameState('MAP');
  };

  const continueNextMission = () => {
    const activeLevels = dbLevels.length > 0 ? dbLevels : defaultLevels;
    if (unlockedLevels > selectedLevel && selectedLevel < activeLevels.length) {
      const currentIdx = activeLevels.findIndex(l => (l.levelNumber || l.id) === selectedLevel);
      if (currentIdx !== -1 && currentIdx + 1 < activeLevels.length) {
        const nextLevelId = activeLevels[currentIdx + 1].levelNumber || activeLevels[currentIdx + 1].id;
        startGame(nextLevelId);
      } else {
        setGameState('MAP');
      }
    } else {
      setGameState('MAP');
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const loadHtml2Canvas = async () => {
    if ((window as any).html2canvas) return (window as any).html2canvas;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => resolve((window as any).html2canvas);
      document.body.appendChild(script);
    });
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0d1627' });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement('a');
      a.href = url;
      a.download = `prasordu-badge-level-${selectedLevel}.png`;
      a.click();
    } catch (e) {
      console.error("Failed to generate image", e);
    }
  };

  const handleShareWA = async () => {
    // Web Share API if on mobile, otherwise just generic whatsapp link
    const text = `Saya baru saja menyelesaikan Misi Level ${selectedLevel} di Prasordu Adventure Digital Mission! Ayo bergabung bersama Pramuka dan selesaikan tantangannya di website ini!`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const renderGameUI = () => {
    const q = getActiveQuestions()[currentQuestion];
    
    if (q.type === 'QUIZ') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {q.options.map((option: string, index: number) => {
            let btnStyle = "bg-slate-800 border-slate-600 hover:border-emerald-500 hover:bg-slate-700";
            if (selectedAnswer !== null) {
              if (index === q.answer) btnStyle = "bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]";
              else if (index === selectedAnswer) btnStyle = "bg-red-600 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]";
              else btnStyle = "bg-slate-900 border-slate-800 opacity-50";
            }
            return (
              <button key={index} disabled={selectedAnswer !== null} onClick={() => handleQuizAnswer(index)} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left font-bold text-sm sm:text-base md:text-lg transition-all ${btnStyle}`}>
                <span className="inline-block w-6 sm:w-8 text-slate-400 mr-1 sm:mr-2">{['A', 'B', 'C', 'D'][index]}</span>
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    if (q.type === 'YES_NO') {
      return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-xl mx-auto w-full">
          <button 
            disabled={selectedAnswer !== null} 
            onClick={() => handleQuizAnswer(true)} 
            className={`flex-1 flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-4 py-4 sm:py-8 rounded-2xl sm:rounded-3xl border-4 transition-all ${
              selectedAnswer !== null 
                ? (q.answer === true ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_30px_#10b981]' : selectedAnswer === true ? 'bg-red-600 border-red-400' : 'bg-slate-900 border-slate-800 opacity-50')
                : 'bg-emerald-900/50 border-emerald-500/50 hover:bg-emerald-800 hover:scale-105'
            }`}
          >
            <CheckCircle2 size={64} className={`w-10 h-10 sm:w-16 sm:h-16 ${selectedAnswer !== null && q.answer === true ? "text-white" : "text-emerald-400"}`} />
            <span className="font-black text-xl sm:text-2xl tracking-widest text-white">BENAR</span>
          </button>
          
          <button 
            disabled={selectedAnswer !== null} 
            onClick={() => handleQuizAnswer(false)} 
            className={`flex-1 flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-4 py-4 sm:py-8 rounded-2xl sm:rounded-3xl border-4 transition-all ${
              selectedAnswer !== null 
                ? (q.answer === false ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_30px_#10b981]' : selectedAnswer === false ? 'bg-red-600 border-red-400' : 'bg-slate-900 border-slate-800 opacity-50')
                : 'bg-red-900/50 border-red-500/50 hover:bg-red-800 hover:scale-105'
            }`}
          >
            <XCircle size={64} className={`w-10 h-10 sm:w-16 sm:h-16 ${selectedAnswer !== null && q.answer === false ? "text-white" : "text-red-400"}`} />
            <span className="font-black text-xl sm:text-2xl tracking-widest text-white">SALAH</span>
          </button>
        </div>
      );
    }

    if (q.type === 'OPEN_BOX' || q.type === 'FILL_BLANK') {
      return (
        <div className="flex flex-col items-center gap-6">
          {q.type === 'OPEN_BOX' && (
            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 flex items-center justify-center transition-all duration-500 ${isAnswerCorrect ? 'border-emerald-400 bg-emerald-900/50 scale-110 shadow-[0_0_30px_#10b981]' : 'border-amber-400 bg-amber-900/20'}`}>
              <Box className={`w-12 h-12 sm:w-16 sm:h-16 ${isAnswerCorrect ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
            </div>
          )}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder={q.type === 'OPEN_BOX' ? "Masukkan kode rahasia..." : "Ketik kata yang hilang..."} 
              value={textInput} 
              onChange={e => setTextInput(e.target.value)}
              disabled={isAnswerCorrect !== null}
              className="flex-1 w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3 sm:py-4 font-bold text-sm sm:text-lg focus:border-amber-400 outline-none uppercase text-center tracking-widest"
              onKeyDown={e => e.key === 'Enter' && handleTextAnswer()}
            />
            <button onClick={handleTextAnswer} disabled={isAnswerCorrect !== null} className="w-full sm:w-auto py-3 sm:py-0 bg-amber-500 hover:bg-amber-400 text-black px-8 font-black rounded-xl transition-colors">
              SUBMIT
            </button>
          </div>
        </div>
      );
    }

    if (q.type === 'ANAGRAMS') {
      // Scramble the target word
      const target = String(q.answer).toUpperCase();
      // Only scramble initially if textInput is empty to avoid reshuffling
      const letters = textInput === "" ? target.split('').sort(() => Math.random() - 0.5) : [];
      
      return (
        <div className="flex flex-col items-center gap-6">
          {textInput === "" && (
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 px-2">
              {letters.map((letter: string, i: number) => (
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay: i*0.1}} key={i} className="w-10 h-10 sm:w-14 sm:h-14 bg-cyan-900/50 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl border-b-2 sm:border-b-4 border-cyan-700 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  {letter}
                </motion.div>
              ))}
            </div>
          )}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Susun kata yang benar..." 
              value={textInput} 
              onChange={e => setTextInput(e.target.value)}
              disabled={isAnswerCorrect !== null}
              className="flex-1 w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3 sm:py-4 font-black text-lg sm:text-2xl focus:border-cyan-400 outline-none text-center tracking-widest uppercase"
              onKeyDown={e => e.key === 'Enter' && handleTextAnswer()}
            />
            <button onClick={handleTextAnswer} disabled={isAnswerCorrect !== null} className="w-full sm:w-auto py-3 sm:py-0 bg-cyan-500 hover:bg-cyan-400 text-black px-6 font-black rounded-xl flex justify-center items-center"><SpellCheck /></button>
          </div>
        </div>
      );
    }

    if (q.type === 'MATCHING_PAIRS') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto w-full">
          {memoryCards.map((card, i) => {
            const isFlipped = flippedCards.includes(i) || card.isMatched;
            return (
              <div 
                key={i} 
                onClick={() => {
                  if (!isFlipped && flippedCards.length < 2) {
                    playSound('flip');
                    setFlippedCards([...flippedCards, i]);
                  }
                }}
                className={`relative w-full aspect-square rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-500 transform-gpu ${isFlipped ? '[transform:rotateY(180deg)]' : 'hover:-translate-y-2'}`}
                style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
              >
                {/* Back of Card */}
                <div className="absolute inset-0 bg-indigo-900 border-2 sm:border-4 border-indigo-500/50 rounded-xl sm:rounded-2xl flex items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                  <Star className="text-indigo-500/30 w-1/2 h-1/2" />
                </div>
                
                {/* Front of Card */}
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 sm:p-4 border-2 sm:border-4 text-center break-words [transform:rotateY(180deg)] shadow-xl ${card.isMatched ? 'bg-emerald-900 border-emerald-400 text-emerald-100 shadow-[0_0_20px_#10b981]' : 'bg-slate-800 border-indigo-400 text-white'}`} style={{ backfaceVisibility: 'hidden' }}>
                  <span className="font-bold text-xs sm:text-lg md:text-xl">{card.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return <div>Tipe game belum didukung UI ini.</div>;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans selection:bg-emerald-500 overflow-hidden relative">
      {/* Dynamic Backgrounds based on Level Type */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${gameState === 'PLAYING' && getActiveQuestions()[currentQuestion]?.type === 'OPEN_BOX' ? 'bg-amber-600/20' : gameState === 'PLAYING' && getActiveQuestions()[currentQuestion]?.type === 'YES_NO' ? 'bg-indigo-600/20' : 'bg-emerald-600/20'}`} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-600/20 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 w-full h-full min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40 backdrop-blur-md z-50">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 hidden sm:block">
              PRASORDU <span className="text-white">ARENA</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 font-bold">
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
              <span className="text-xs text-slate-400 uppercase tracking-widest">{userProfile.fullName || "GUEST"}</span>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm">{userProfile.squad.icon} {userProfile.squad.name}</span>
                <span className="text-cyan-400 text-sm">{userProfile.weapon.icon}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Trophy size={20} />
              <span className="text-xl">{score}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden relative z-10 w-full h-full">
          <AnimatePresence mode="wait">
            
            {/* 0. SETUP STATE */}
            {gameState === 'SETUP' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex items-center justify-center p-4"
              >
                <div className="max-w-4xl w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                  <h2 className="text-4xl font-black text-center mb-8 tracking-tight">SIAPKAN <span className="text-emerald-400">IDENTITASMU</span></h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: Basic Info */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 mb-2 tracking-widest">NAMA LENGKAP</label>
                        <input 
                          type="text" 
                          value={userProfile.fullName}
                          onChange={e => setUserProfile(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Masukkan nama..."
                          className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-400 mb-2 tracking-widest">PILIH JENIS REGU</label>
                        <div className="flex gap-3">
                          {['Putra', 'Putri'].map(t => (
                            <button 
                              key={t}
                              onClick={() => setUserProfile(prev => ({ ...prev, squadType: t as any, squad: (t === 'Putra' ? SQUAD_PUTRA : SQUAD_PUTRI)[0] }))}
                              className={`flex-1 py-4 rounded-2xl font-black transition-all border-2 ${userProfile.squadType === t ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                            >
                              {t.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-400 mb-2 tracking-widest">PILIH SENJATA PUSAKA</label>
                        <div className="grid grid-cols-5 gap-2">
                          {WEAPONS.map(w => (
                            <button 
                              key={w.id}
                              onClick={() => setUserProfile(prev => ({ ...prev, weapon: w }))}
                              title={w.name}
                              className={`aspect-square flex items-center justify-center rounded-xl text-2xl border-2 transition-all ${userProfile.weapon.id === w.id ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_#22d3ee44]' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                            >
                              {w.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Squad Selection */}
                    <div className="flex flex-col">
                      <label className="block text-xs font-black text-slate-400 mb-2 tracking-widest">PILIH LOGO REGU ({userProfile.squadType.toUpperCase()})</label>
                      <div className="flex-1 grid grid-cols-3 gap-3 overflow-y-auto max-h-[300px] p-2 bg-black/20 rounded-2xl border border-white/5">
                        {(userProfile.squadType === 'Putra' ? SQUAD_PUTRA : SQUAD_PUTRI).map(s => (
                          <button 
                            key={s.id}
                            onClick={() => setUserProfile(prev => ({ ...prev, squad: s }))}
                            className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all p-2 ${userProfile.squad.id === s.id ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                          >
                            <span className="text-4xl">{s.icon}</span>
                            <span className="text-[10px] font-black text-center leading-none">{s.name}</span>
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        disabled={!userProfile.fullName}
                        onClick={() => setGameState('MAP')}
                        className="mt-6 w-full py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-2xl rounded-2xl transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:grayscale"
                      >
                        MULAI PETUALANGAN
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1. MAP SELECTION STATE (SPACE THEME) */}
            {gameState === 'MAP' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col relative overflow-hidden"
              >
                {/* Space Background Elements */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full animate-pulse" />
                  <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(30,41,59,1)_0%,rgba(7,11,20,1)_100%)] opacity-50" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full px-6">
                  <div className="text-center mt-10 mb-16">
                    <h2 className="text-5xl font-black mb-2 tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">GALAKSI <span className="text-emerald-400">PRAMUKA</span></h2>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Level: {unlockedLevels} / 49 • Region: Nebula</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center py-10">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-20 relative w-full">
                      {(dbLevels.length > 0 ? dbLevels : defaultLevels).map((level: any, i: number) => {
                        const isUnlocked = level.levelNumber ? level.levelNumber <= unlockedLevels : level.id <= unlockedLevels;
                        const isCurrent = level.levelNumber ? level.levelNumber === unlockedLevels : level.id === unlockedLevels;
                        const levelId = level.levelNumber || level.id;
                        const badge = getBadgeInfo(levelId);
                        
                        return (
                          <motion.div 
                            key={levelId}
                            initial={{ y: i % 2 === 0 ? 20 : -20 }}
                            animate={{ y: i % 2 === 0 ? -10 : 10 }}
                            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', delay: i * 0.2 }}
                            className="relative"
                          >
                            {/* Connector Line (simplified) */}
                            {i > 0 && (
                              <div className="absolute -left-10 top-1/2 w-10 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent hidden lg:block" />
                            )}

                            <div className="flex flex-col items-center">
                              {/* Floating Island Platform */}
                              <div className="relative mb-4 group">
                                {/* Stars above platform */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
                                  {[1, 2, 3].map(s => (
                                    <Star key={s} size={14} className={isUnlocked ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
                                  ))}
                                </div>

                                <button
                                  onClick={() => isUnlocked && startGame(levelId)}
                                  disabled={!isUnlocked}
                                  className={`w-28 h-28 md:w-36 md:h-36 rounded-full relative transition-all duration-500
                                    ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                                  `}
                                >
                                  {/* Platform Base (Isometric look) */}
                                  <div className={`absolute inset-0 rounded-full border-b-8 border-slate-900 shadow-2xl transition-all
                                    ${isCurrent ? 'bg-gradient-to-b from-emerald-400 to-emerald-900 border-emerald-950 scale-110' : 
                                      isUnlocked ? 'bg-gradient-to-b from-indigo-500 to-indigo-900 border-indigo-950' : 'bg-slate-800 border-slate-900 opacity-40'}
                                  `} />
                                  
                                  {/* Content on platform */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    {isUnlocked ? (
                                      <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/40 flex items-center justify-center mb-1 border border-white/10 ${isCurrent && 'animate-bounce'}`}>
                                          <badge.icon size={24} className={isCurrent ? "text-white" : "text-white/60"} />
                                        </div>
                                        <span className="text-[10px] md:text-xs font-black text-white leading-none tracking-tighter text-center px-2">{badge.title}</span>
                                      </div>
                                    ) : (
                                      <Lock size={32} className="text-slate-600" />
                                    )}
                                  </div>

                                  {/* Current level indicator rings */}
                                  {isCurrent && (
                                    <>
                                      <div className="absolute -inset-4 rounded-full border-2 border-emerald-400/30 animate-[ping_3s_infinite]" />
                                      <div className="absolute -inset-8 rounded-full border border-emerald-400/10 animate-[ping_4s_infinite]" />
                                    </>
                                  )}

                                  {/* Level Number Bubble */}
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-sm shadow-xl z-20">
                                    {levelId}
                                  </div>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. MISSION BRIEFING STATE */}
            {gameState === 'BRIEFING' && (
              <motion.div
                key="briefing"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="max-w-2xl w-full bg-[#0d1627] border border-emerald-500/30 rounded-3xl p-6 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                      <Shield className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                      <h2 className="text-emerald-500 font-bold tracking-widest text-xs md:text-sm mb-1">MISSION BRIEFING</h2>
                      <h3 className="text-xl md:text-3xl font-black">{getCurrentLevelInfo().title}</h3>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 bg-black/30 p-4 md:p-6 rounded-2xl border border-white/5">
                    <p className="text-slate-300 leading-relaxed text-sm md:text-lg">
                      Selesaikan <span className="text-emerald-400 font-bold">{getCurrentLevelInfo().questions?.length || 0} Tantangan</span> untuk mendapatkan Bintang 5.
                      <strong className="text-red-400 block mt-2">Peringatan: Satu kesalahan, dan kamu akan dilempar ke Level 1!</strong>
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-4">
                      <div className="flex items-center gap-2 text-xs md:text-sm font-bold bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                        <Clock size={16} className="text-amber-400" /> 15s / Task
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm font-bold bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                        <Heart size={16} className="text-red-400" /> 1 HP
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <button onClick={startLevel} className="flex-1 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg md:text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      START MISSION
                    </button>
                    <button onClick={quitToMap} className="px-6 py-3 md:px-8 md:py-4 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl transition-all">
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. PLAYING STATE */}
            {gameState === 'PLAYING' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center"
              >
                {/* Game HUD */}
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-6 md:mb-8 bg-black/40 p-4 md:p-6 rounded-3xl border border-white/5 backdrop-blur-md gap-4">
                  <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[200px]">
                    <div className="flex justify-between mb-1 md:mb-2 text-xs md:text-base">
                      <span className="font-bold text-red-400 flex items-center gap-1 md:gap-2"><Heart size={16} className="md:w-[18px] md:h-[18px]" /> HP</span>
                      <span className="font-bold text-white">{hp}/100</span>
                    </div>
                    <div className="h-2 md:h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <motion.div initial={{ width: "100%" }} animate={{ width: `${hp}%` }} className={`h-full rounded-full ${hp > 35 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-red-600 animate-pulse'}`} />
                    </div>
                  </div>

                  <div className="text-center px-2 order-first sm:order-none w-full sm:w-auto">
                    <span className="text-slate-500 font-bold text-xs md:text-sm tracking-widest block mb-1">TASK {currentQuestion + 1}/{getActiveQuestions().length}</span>
                    <h3 className="text-lg md:text-2xl font-black text-emerald-400 uppercase leading-tight">{getCurrentLevelInfo().title}</h3>
                  </div>

                  <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[200px] sm:text-right">
                    <div className="flex justify-between sm:justify-end mb-1 md:mb-2 text-xs md:text-base">
                      <span className={`font-bold flex items-center gap-1 md:gap-2 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                        <Clock size={16} className="md:w-[18px] md:h-[18px]" /> {timeLeft}s
                      </span>
                    </div>
                    <div className="h-2 md:h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex justify-end">
                      <motion.div initial={{ width: "100%" }} animate={{ width: `${(timeLeft / (getActiveQuestions()[currentQuestion]?.duration || 15)) * 100}%` }} className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'}`} />
                    </div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-[#0f1c2e] p-4 sm:p-8 md:p-12 rounded-3xl border-2 border-slate-700 shadow-2xl relative w-full">
                  
                  {getActiveQuestions()[currentQuestion]?.imageUrl && (
                    <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-6 rounded-2xl overflow-hidden border-2 sm:border-4 border-slate-600 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black">
                      <img src={getActiveQuestions()[currentQuestion].imageUrl} className="w-full h-full object-cover" alt="Clue" />
                    </div>
                  )}

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed text-white text-center mb-6 sm:mb-10 px-2 sm:px-0">
                    {getActiveQuestions()[currentQuestion].question}
                  </h2>

                  {renderGameUI()}

                  {/* Feedback overlay */}
                  <AnimatePresence>
                    {isAnswerCorrect !== null && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 px-4 sm:px-8 py-2 sm:py-3 rounded-full font-black text-sm sm:text-xl border-2 shadow-2xl z-20 w-max whitespace-nowrap ${
                          isAnswerCorrect ? 'bg-emerald-900 text-emerald-400 border-emerald-500' : 'bg-red-900 text-red-400 border-red-500'
                        }`}
                      >
                        {isAnswerCorrect ? 'PERFECT STRIKE!' : 'DAMAGE TAKEN!'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* 4. GAMEOVER / VICTORY STATES */}
            {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex items-center justify-center p-4 sm:p-6"
              >
                <div className="text-center max-w-xl w-full">
                  <div ref={cardRef} className="bg-[#0d1627] p-6 sm:p-12 pb-14 sm:pb-16 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden mb-6">
                    
                    {gameState === 'VICTORY' ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent" />
                        
                        {/* DYNAMIC BADGE RENDERER BASED ON LEVEL */}
                        {(() => {
                          const badge = getBadgeInfo(selectedLevel);
                          const BadgeIcon = badge.icon;

                          return (
                            <div className="relative mb-6 sm:mb-8 pt-2 sm:pt-4">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full animate-ping" />
                              <div className={`mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl rotate-45 bg-gradient-to-br border-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10 ${badge.color}`}>
                                <div className="-rotate-45 text-white drop-shadow-lg flex items-center justify-center w-full h-full">
                                  <BadgeIcon className="w-12 h-12 sm:w-16 sm:h-16" />
                                </div>
                              </div>
                              <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2">
                                <span className={`px-3 py-1 sm:px-4 sm:py-1 rounded-full text-[10px] sm:text-xs font-black tracking-widest border bg-black/50 ${badge.color.includes('text-') ? '' : 'text-white'}`}>
                                  LEVEL BADGE: {badge.title}
                                </span>
                                {badge.special && (
                                  <span className="text-[10px] text-amber-400 font-bold animate-pulse max-w-[200px] leading-tight">
                                    {badge.special}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase tracking-widest mt-2 sm:mt-4">MISSION CLEARED</h2>
                        
                        <div className="flex items-center justify-center gap-4 mb-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                          <div className="text-4xl bg-black/40 w-16 h-16 rounded-full flex items-center justify-center border border-amber-500/50">
                            {userProfile.squad.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AGENT IDENTIFIED</p>
                            <p className="text-xl font-black text-white">{userProfile.fullName}</p>
                            <p className="text-xs font-bold text-amber-400">REGU {userProfile.squad.name} • {userProfile.weapon.name}</p>
                          </div>
                        </div>

                        <div className="flex justify-center gap-1 sm:gap-2 mb-4 text-amber-400">
                          <Star className="fill-amber-400 drop-shadow-[0_0_10px_#fbbf24] w-6 h-6 sm:w-8 sm:h-8" />
                          <Star className="fill-amber-400 drop-shadow-[0_0_10px_#fbbf24] w-6 h-6 sm:w-8 sm:h-8" />
                          <Star className="fill-amber-400 drop-shadow-[0_0_10px_#fbbf24] w-6 h-6 sm:w-8 sm:h-8" />
                          <Star className="fill-amber-400 drop-shadow-[0_0_10px_#fbbf24] w-6 h-6 sm:w-8 sm:h-8" />
                          <Star className="fill-amber-400 drop-shadow-[0_0_10px_#fbbf24] w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        
                        <p className="text-emerald-400 font-bold text-sm sm:text-lg mb-2">Keahlian Pramukamu terbukti tangguh!</p>
                        <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 px-2 sm:px-4 leading-relaxed">
                          Kumpulkan badge ini dan laporkan kepada pembina untuk ditukarkan menjadi point tambahan pada Raport dan Bintang Tahunan Seragam Pramuka.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent" />
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500 text-red-400 shadow-[0_0_50px_rgba(239,68,68,0.5)] mt-4">
                          <Sword className="w-10 h-10 sm:w-12 sm:h-12" />
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase tracking-widest mt-4">MISSION FAILED</h2>
                        <p className="text-red-400 font-bold text-sm sm:text-lg mb-8">Kamu melakukan kesalahan. Kembali ke Level 1!</p>
                      </>
                    )}

                    <div className="bg-black/50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/5 mx-auto max-w-xs sm:max-w-sm w-full">
                      <p className="text-slate-400 font-bold mb-1 sm:mb-2 text-xs sm:text-sm">TOTAL SCORE</p>
                      <p className="text-4xl sm:text-5xl font-black text-emerald-400 drop-shadow-md">{score}</p>
                    </div>

                    {/* FOOTER TEXT INSIDE CARD */}
                    <div className="absolute bottom-0 left-0 w-full bg-emerald-950/50 py-2 sm:py-3 border-t border-emerald-500/20">
                      <p className="text-emerald-400/80 text-[8px] sm:text-[10px] md:text-xs font-bold px-2 sm:px-4 leading-relaxed uppercase tracking-wider">
                        Mari bergabung bersama menjadi bagian dari Scout Sordu Adventure Digital Mission<br/>
                        <span className="text-slate-400 text-[8px] sm:text-[10px] lowercase">Website ini dikelola oleh prasordu official</span>
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-4 flex-row mb-6 sm:mb-8 justify-center items-center">
                    {gameState === 'VICTORY' && (
                      <div className="flex gap-4">
                        <button onClick={handleDownloadCard} className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-full transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center">
                          <Download size={24} className="sm:w-7 sm:h-7" />
                        </button>
                        <button onClick={handleShareWA} className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 hover:bg-green-400 text-white font-black rounded-full transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center">
                          <Share2 size={24} className="sm:w-7 sm:h-7" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {gameState === 'VICTORY' && (
                      <button onClick={continueNextMission} className="w-full sm:flex-1 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm sm:text-base rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        NEXT MISSION
                      </button>
                    )}
                    <button onClick={quitToMap} className="w-full sm:flex-1 py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm sm:text-base rounded-xl transition-all">
                      PETA UTAMA
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

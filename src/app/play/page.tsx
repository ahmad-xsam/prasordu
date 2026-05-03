"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sword, Swords, Heart, Clock, ArrowLeft, Star, Trophy, Unlock, Lock, Box, SpellCheck } from "lucide-react";
import Link from "next/link";

// ---------------- DEFAULT GAME DATA (Fallback) ----------------
const defaultLevels = [
  { id: 1, title: "Sejarah Pramuka Indonesia", type: "QUIZ", points: 100 },
  { id: 2, title: "Pencocokan Kata Sandi", type: "MATCH_WORD", points: 150 },
  { id: 3, title: "Membuka Kotak Rahasia", type: "OPEN_BOX", points: 200 },
];

const defaultQuestions = [
  { type: 'QUIZ', question: "Siapakah Bapak Pramuka Indonesia?", options: ["Soekarno", "Sri Sultan Hamengkubuwono IX", "Ki Hajar Dewantara", "Baden Powell"], answer: 1 },
  { type: 'QUIZ', question: "Pada tanggal berapakah Hari Pramuka diperingati?", options: ["14 Agustus", "17 Agustus", "28 Oktober", "1 Juni"], answer: 0 },
];

export default function PlayGame() {
  const [gameState, setGameState] = useState<'MAP' | 'BRIEFING' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('MAP');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);
  const [score, setScore] = useState(0);

  // Gameplay States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hp, setHp] = useState(100);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Levels Data from Admin (Fallback for now)
  const [dbLevels, setDbLevels] = useState<any[]>([]);

  // Sound Effects
  const playSound = (type: 'start' | 'correct' | 'wrong' | 'victory' | 'gameover') => {
    const audio = new Audio();
    if (type === 'start') audio.src = 'https://actions.google.com/sounds/v1/foley/whoosh_heavy.ogg';
    if (type === 'correct') audio.src = 'https://actions.google.com/sounds/v1/cartoon/woodpecker.ogg'; 
    if (type === 'wrong') audio.src = 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg';
    if (type === 'victory') audio.src = 'https://actions.google.com/sounds/v1/crowds/light_applause.ogg';
    if (type === 'gameover') audio.src = 'https://actions.google.com/sounds/v1/cartoon/conk_head.ogg';
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio prevented", e));
  };

  useEffect(() => {
    // In a real app, fetch from /api/admin/games here
    // fetch('/api/admin/games').then(res => res.json()).then(data => setDbLevels(data.levels));
  }, []);

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

  const getActiveQuestions = () => {
    // Return DB questions if exist, otherwise fallback
    if (dbLevels.length > 0) return dbLevels[selectedLevel - 1]?.questions || defaultQuestions;
    
    // Fallback logic for demo
    if (selectedLevel === 2) {
      return [{ type: 'MATCH_WORD', question: "Susun huruf menjadi: Tunas Kelapa", options: ["P", "E", "A", "L", "K", "A", "T", "U", "N", "S"], answer: "TUNAS KELAPA" }];
    }
    if (selectedLevel === 3) {
      return [{ type: 'OPEN_BOX', question: "Berapa usia Gerakan Pramuka pada tahun 2021 (Lahir 1961)?", options: [], answer: "60" }];
    }
    return defaultQuestions;
  };

  const startGame = (levelId: number) => {
    playSound('start');
    setSelectedLevel(levelId);
    setGameState('BRIEFING');
  };

  const startLevel = () => {
    playSound('start');
    setCurrentQuestion(0);
    setHp(100);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setTextInput("");
    setIsAnswerCorrect(null);
    setGameState('PLAYING');
  };

  const handleAnswerTimeout = () => {
    processResult(false, null);
  };

  const handleQuizAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const questions = getActiveQuestions();
    const correct = index === questions[currentQuestion].answer;
    processResult(correct, index);
  };

  const handleTextAnswer = () => {
    if (isAnswerCorrect !== null) return;
    const questions = getActiveQuestions();
    const correct = textInput.toUpperCase().trim() === String(questions[currentQuestion].answer).toUpperCase();
    processResult(correct, -1);
  };

  const processResult = (correct: boolean, ansIndex: number | null) => {
    setIsAnswerCorrect(correct);
    playSound(correct ? 'correct' : 'wrong');

    if (correct) {
      setScore(prev => prev + 50 + (timeLeft * 2));
    } else {
      setHp(prev => Math.max(0, prev - 35));
    }

    setTimeout(() => {
      if (!correct) {
        playSound('gameover');
        setUnlockedLevels(1); // Perintah: Kembali ke misi 1 lagi jika ada yang salah
        setGameState('GAMEOVER');
      } else if (currentQuestion < getActiveQuestions().length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(15);
        setSelectedAnswer(null);
        setTextInput("");
        setIsAnswerCorrect(null);
      } else {
        playSound('victory');
        if (selectedLevel === unlockedLevels && unlockedLevels < defaultLevels.length) {
          setUnlockedLevels(prev => prev + 1);
        }
        setGameState('VICTORY');
      }
    }, 2000);
  };

  const quitToMap = () => setGameState('MAP');

  const continueNextMission = () => {
    if (unlockedLevels > selectedLevel) {
      startGame(selectedLevel + 1);
    } else {
      setGameState('MAP');
    }
  };

  const renderGameUI = () => {
    const q = getActiveQuestions()[currentQuestion];
    
    if (q.type === 'QUIZ') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((option: string, index: number) => {
            let btnStyle = "bg-slate-800 border-slate-600 hover:border-emerald-500 hover:bg-slate-700";
            if (selectedAnswer !== null) {
              if (index === q.answer) btnStyle = "bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]";
              else if (index === selectedAnswer) btnStyle = "bg-red-600 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]";
              else btnStyle = "bg-slate-900 border-slate-800 opacity-50";
            }
            return (
              <button key={index} disabled={selectedAnswer !== null} onClick={() => handleQuizAnswer(index)} className={`p-6 rounded-2xl border-2 text-left font-bold text-lg transition-all ${btnStyle}`}>
                <span className="inline-block w-8 text-slate-400 mr-2">{['A', 'B', 'C', 'D'][index]}</span>
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    if (q.type === 'OPEN_BOX') {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className={`w-32 h-32 rounded-2xl border-4 flex items-center justify-center transition-all duration-500 ${isAnswerCorrect ? 'border-emerald-400 bg-emerald-900/50 scale-110 shadow-[0_0_30px_#10b981]' : 'border-amber-400 bg-amber-900/20'}`}>
            <Box size={64} className={isAnswerCorrect ? 'text-emerald-400' : 'text-amber-400 animate-pulse'} />
          </div>
          <div className="w-full max-w-md flex gap-2">
            <input 
              type="text" 
              placeholder="Masukkan kode rahasia kotak..." 
              value={textInput} 
              onChange={e => setTextInput(e.target.value)}
              disabled={isAnswerCorrect !== null}
              className="flex-1 bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3 font-bold text-lg focus:border-amber-400 outline-none"
            />
            <button onClick={handleTextAnswer} disabled={isAnswerCorrect !== null} className="bg-amber-500 hover:bg-amber-400 text-black px-6 font-black rounded-xl">Buka</button>
          </div>
        </div>
      );
    }

    if (q.type === 'MATCH_WORD') {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {q.options.map((letter: string, i: number) => (
              <div key={i} className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center font-black text-xl border-b-4 border-slate-900">{letter}</div>
            ))}
          </div>
          <div className="w-full max-w-md flex gap-2">
            <input 
              type="text" 
              placeholder="Ketik kata yang benar..." 
              value={textInput} 
              onChange={e => setTextInput(e.target.value)}
              disabled={isAnswerCorrect !== null}
              className="flex-1 bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3 font-bold text-lg focus:border-cyan-400 outline-none text-center tracking-widest uppercase"
            />
            <button onClick={handleTextAnswer} disabled={isAnswerCorrect !== null} className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 font-black rounded-xl"><SpellCheck /></button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans selection:bg-emerald-500 overflow-hidden relative">
      {/* Dynamic Backgrounds based on Level Type */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${gameState === 'PLAYING' && getActiveQuestions()[currentQuestion]?.type === 'OPEN_BOX' ? 'bg-amber-600/20' : 'bg-emerald-600/20'}`} />
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
            <div className="flex items-center gap-2 text-emerald-400">
              <Trophy size={20} />
              <span className="text-xl">{score}</span>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-sm flex items-center gap-2">
              <Star size={14} className="text-emerald-400" /> SCOUT
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* 1. MAP SELECTION STATE */}
            {gameState === 'MAP' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col max-w-6xl mx-auto w-full"
              >
                <div className="text-center mb-10 mt-6">
                  <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight uppercase">Peta <span className="text-emerald-400">Petualangan</span></h2>
                  <p className="text-slate-400 text-lg">Taklukkan misi dan ambil Aset 3D Legendari dari setiap Pos.</p>
                </div>

                <div className="flex-1 relative flex items-center justify-center py-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 w-full px-4 max-w-4xl mx-auto">
                    {defaultLevels.map((level, i) => {
                      const isUnlocked = level.id <= unlockedLevels;
                      const isCurrent = level.id === unlockedLevels;
                      
                      return (
                        <motion.div 
                          key={level.id}
                          whileHover={isUnlocked ? { y: -10, scale: 1.05 } : {}}
                          className={`flex flex-col items-center gap-4 ${!isUnlocked && 'opacity-50 grayscale'}`}
                        >
                          <button
                            onClick={() => isUnlocked && startGame(level.id)}
                            disabled={!isUnlocked}
                            className={`w-32 h-32 rounded-3xl flex items-center justify-center border-4 shadow-2xl relative transition-all overflow-hidden
                              ${isCurrent ? 'bg-emerald-900 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)]' : 
                                isUnlocked ? 'bg-slate-800 border-emerald-700' : 'bg-slate-900 border-slate-700'}
                            `}
                          >
                            {/* Dummy Placeholder for 3D Asset from Flaticon/Itchio */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://cdn-icons-png.flaticon.com/512/5260/5260498.png')] bg-cover bg-center" />
                            
                            {isUnlocked ? (
                              level.type === 'QUIZ' ? <Swords size={48} className={isCurrent ? "text-emerald-400 drop-shadow-[0_0_10px_#10b981] z-10" : "text-emerald-600 z-10"} /> :
                              level.type === 'OPEN_BOX' ? <Box size={48} className={isCurrent ? "text-amber-400 drop-shadow-[0_0_10px_#fbbf24] z-10" : "text-amber-600 z-10"} /> :
                              <SpellCheck size={48} className={isCurrent ? "text-cyan-400 drop-shadow-[0_0_10px_#22d3ee] z-10" : "text-cyan-600 z-10"} />
                            ) : (
                              <Lock size={48} className="text-slate-600 z-10" />
                            )}
                            
                            {isCurrent && <span className="absolute -inset-2 rounded-3xl border-2 border-emerald-400 animate-ping opacity-50" />}
                            
                            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-black border-2 border-slate-700 flex items-center justify-center font-bold">
                              {level.id}
                            </div>
                          </button>
                          
                          <div className="text-center bg-slate-900/50 p-3 rounded-xl border border-white/5 w-full">
                            <h3 className="font-bold text-sm text-slate-200 mb-1">{level.title}</h3>
                            <span className="text-xs text-emerald-500 font-black px-2 py-1 bg-emerald-500/10 rounded-md block">Tipe: {level.type}</span>
                          </div>
                        </motion.div>
                      );
                    })}
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
                <div className="max-w-2xl w-full bg-[#0d1627] border border-emerald-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <Shield size={32} />
                    </div>
                    <div>
                      <h2 className="text-emerald-500 font-bold tracking-widest text-sm mb-1">MISSION BRIEFING</h2>
                      <h3 className="text-3xl font-black">{defaultLevels[selectedLevel - 1].title}</h3>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10 bg-black/30 p-6 rounded-2xl border border-white/5">
                    <p className="text-slate-300 leading-relaxed text-lg">
                      Uji pengetahuanmu dalam mode <span className="text-emerald-400 font-bold">{defaultLevels[selectedLevel - 1].type}</span>. 
                      Selesaikan misi untuk mendapatkan Bintang 5 dan melaju ke level berikutnya!
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-sm font-bold bg-white/5 px-4 py-2 rounded-lg">
                        <Clock size={16} className="text-amber-400" /> 15s / Task
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold bg-white/5 px-4 py-2 rounded-lg">
                        <Heart size={16} className="text-red-400" /> 100 HP
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={startLevel} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      START MISSION
                    </button>
                    <button onClick={quitToMap} className="px-8 py-4 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl transition-all">
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
                <div className="flex justify-between items-end mb-8 bg-black/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="flex-1 max-w-[200px]">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-red-400 flex items-center gap-2"><Heart size={18} /> HP</span>
                      <span className="font-bold text-white">{hp}/100</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <motion.div initial={{ width: "100%" }} animate={{ width: `${hp}%` }} className={`h-full rounded-full ${hp > 35 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-red-600 animate-pulse'}`} />
                    </div>
                  </div>

                  <div className="text-center px-4">
                    <span className="text-slate-500 font-bold text-sm tracking-widest">TASK {currentQuestion + 1}/{getActiveQuestions().length}</span>
                    <h3 className="text-xl md:text-2xl font-black text-emerald-400 uppercase">{defaultLevels[selectedLevel - 1].title}</h3>
                  </div>

                  <div className="flex-1 max-w-[200px] text-right">
                    <div className="flex justify-end mb-2">
                      <span className={`font-bold flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                        <Clock size={18} /> {timeLeft}s
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex justify-end">
                      <motion.div initial={{ width: "100%" }} animate={{ width: `${(timeLeft / 15) * 100}%` }} className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'}`} />
                    </div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-[#0f1c2e] p-8 md:p-12 rounded-3xl border-2 border-slate-700 shadow-2xl relative">
                  <h2 className="text-2xl md:text-3xl font-bold leading-relaxed text-white text-center mb-10">
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
                        className={`absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full font-black text-xl border-2 shadow-2xl z-20 ${
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
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center bg-[#0d1627] p-12 rounded-3xl border border-slate-700 shadow-2xl max-w-xl w-full relative overflow-hidden">
                  
                  {gameState === 'VICTORY' ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent" />
                      <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                        <Trophy size={48} />
                      </div>
                      <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">MISSION CLEARED</h2>
                      
                      <div className="flex justify-center gap-2 mb-6 text-amber-400">
                        <Star className="fill-amber-400" size={32} />
                        <Star className="fill-amber-400" size={32} />
                        <Star className="fill-amber-400" size={32} />
                        <Star className="fill-amber-400" size={32} />
                        <Star className="fill-amber-400" size={32} />
                      </div>
                      <p className="text-emerald-400 font-bold text-lg mb-8">Pangkatmu naik! 5 Bintang didapatkan!</p>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent" />
                      <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500 text-red-400 shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                        <Sword size={48} />
                      </div>
                      <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">MISSION FAILED</h2>
                      <p className="text-red-400 font-bold text-lg mb-8">Kamu kehabisan HP. Coba lagi!</p>
                    </>
                  )}

                  <div className="bg-black/50 rounded-2xl p-6 mb-8 border border-white/5">
                    <p className="text-slate-400 font-bold mb-2">TOTAL SCORE</p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{score}</p>
                  </div>

                  <div className="flex gap-4">
                    {gameState === 'VICTORY' && (
                      <button onClick={continueNextMission} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        NEXT MISSION
                      </button>
                    )}
                    <button onClick={quitToMap} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-xl transition-all">
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

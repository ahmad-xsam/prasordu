"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sword, Swords, Heart, Clock, ArrowLeft, Star, Trophy, Unlock, Lock } from "lucide-react";
import Link from "next/link";

// ---------------- GAME DATA ----------------
const levels = [
  { id: 1, title: "Sejarah Pramuka Indonesia", type: "Quiz", points: 100 },
  { id: 2, title: "Sejarah Pramuka Dunia", type: "Quiz", points: 150 },
  { id: 3, title: "Pengetahuan Kepramukaan", type: "Match", points: 200 },
  { id: 4, title: "Pengetahuan Kepenggalangan", type: "Quiz", points: 250 },
  { id: 5, title: "Atribut Seragam", type: "Puzzle", points: 300 },
  { id: 6, title: "English for Scouts", type: "Quiz", points: 400 },
  { id: 7, title: "Tebakan Sandi-Sandi", type: "Decode", points: 500 },
];

// Mock quiz questions for demonstration
const quizData = [
  {
    question: "Siapakah Bapak Pramuka Indonesia?",
    options: ["Sri Sultan Hamengkubuwono IX", "Soekarno", "Ki Hajar Dewantara", "Baden Powell"],
    answer: 0
  },
  {
    question: "Pada tanggal berapakah Hari Pramuka Indonesia diperingati?",
    options: ["14 Agustus", "17 Agustus", "28 Oktober", "1 Juni"],
    answer: 0
  },
  {
    question: "Apa lambang Gerakan Pramuka Indonesia?",
    options: ["Bintang", "Padi dan Kapas", "Tunas Kelapa", "Burung Garuda"],
    answer: 2
  }
];

// ---------------- COMPONENTS ----------------

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
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0 && selectedAnswer === null) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswer(-1); // Timeout
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, selectedAnswer]);

  const startGame = (levelId: number) => {
    setSelectedLevel(levelId);
    setGameState('BRIEFING');
  };

  const startLevel = () => {
    setCurrentQuestion(0);
    setHp(100);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setGameState('PLAYING');
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === quizData[currentQuestion].answer;
    setIsAnswerCorrect(correct);

    if (correct) {
      setScore(prev => prev + 50 + (timeLeft * 2)); // Bonus time points
    } else {
      setHp(prev => Math.max(0, prev - 35));
    }

    setTimeout(() => {
      if (!correct && hp <= 35) {
        setGameState('GAMEOVER');
      } else if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(15);
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
      } else {
        // Level cleared
        if (selectedLevel === unlockedLevels && unlockedLevels < levels.length) {
          setUnlockedLevels(prev => prev + 1);
        }
        setGameState('VICTORY');
      }
    }, 2000);
  };

  const quitToMap = () => setGameState('MAP');

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans selection:bg-emerald-500 overflow-hidden relative">
      {/* Background with Grid and Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-600/20 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 w-full h-full min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              PRASORDU <span className="text-white">ARENA</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 font-bold">
            <div className="flex items-center gap-2 text-emerald-400">
              <Trophy size={20} />
              <span className="text-xl">{score}</span>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-sm">
              RANK: SCOUT
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
                  <p className="text-slate-400 text-lg">Taklukkan 7 pos untuk menjadi Legenda Pramuka.</p>
                </div>

                <div className="flex-1 relative flex items-center justify-center py-10">
                  {/* Decorative path line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden hidden md:block">
                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${(unlockedLevels / levels.length) * 100}%` }} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-6 md:gap-4 relative z-10 w-full px-4">
                    {levels.map((level, i) => {
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
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-4 shadow-2xl relative
                              ${isCurrent ? 'bg-emerald-900 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 
                                isUnlocked ? 'bg-slate-800 border-emerald-700' : 'bg-slate-900 border-slate-700'}
                            `}
                          >
                            {isUnlocked ? (
                              <Shield size={32} className={isCurrent ? "text-emerald-400 drop-shadow-[0_0_10px_#10b981]" : "text-emerald-600"} />
                            ) : (
                              <Lock size={32} className="text-slate-600" />
                            )}
                            
                            {/* Current level pulse indicator */}
                            {isCurrent && (
                              <span className="absolute -inset-2 rounded-2xl border-2 border-emerald-400 animate-ping opacity-50" />
                            )}
                            
                            {/* Level Number Badge */}
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black border-2 border-slate-700 flex items-center justify-center font-bold text-sm">
                              {level.id}
                            </div>
                          </button>
                          
                          <div className="text-center">
                            <h3 className="font-bold text-sm text-slate-200 mb-1 max-w-[120px]">{level.title}</h3>
                            <span className="text-xs text-emerald-500 font-black">{level.points} PTS</span>
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
                      <Swords size={32} />
                    </div>
                    <div>
                      <h2 className="text-emerald-500 font-bold tracking-widest text-sm mb-1">MISSION BRIEFING</h2>
                      <h3 className="text-3xl font-black">{levels[selectedLevel - 1].title}</h3>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10 bg-black/30 p-6 rounded-2xl border border-white/5">
                    <p className="text-slate-300 leading-relaxed text-lg">
                      Uji pengetahuanmu dalam tantangan <span className="text-emerald-400 font-bold">{levels[selectedLevel - 1].type}</span> ini. 
                      Jawab pertanyaan dengan cepat dan tepat sebelum waktu habis untuk mendapatkan poin maksimal!
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-sm font-bold bg-white/5 px-4 py-2 rounded-lg">
                        <Clock size={16} className="text-amber-400" /> 15s / Pertanyaan
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
                  
                  {/* Health Bar UI */}
                  <div className="flex-1 max-w-[200px]">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-red-400 flex items-center gap-2"><Heart size={18} /> HP</span>
                      <span className="font-bold text-white">{hp}/100</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: `${hp}%` }}
                        className={`h-full rounded-full ${hp > 35 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-red-600 animate-pulse'}`} 
                      />
                    </div>
                  </div>

                  {/* Level Info */}
                  <div className="text-center px-4">
                    <span className="text-slate-500 font-bold text-sm tracking-widest">WAVE {currentQuestion + 1}/{quizData.length}</span>
                    <h3 className="text-2xl font-black text-emerald-400 uppercase">{levels[selectedLevel - 1].title}</h3>
                  </div>

                  {/* Timer UI */}
                  <div className="flex-1 max-w-[200px] text-right">
                    <div className="flex justify-end mb-2">
                      <span className={`font-bold flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                        <Clock size={18} /> {timeLeft}s
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex justify-end">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / 15) * 100}%` }}
                        className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'}`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-[#0f1c2e] p-8 md:p-12 rounded-3xl border-2 border-slate-700 shadow-2xl relative">
                  <h2 className="text-2xl md:text-3xl font-bold leading-relaxed text-white text-center mb-10">
                    {quizData[currentQuestion].question}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizData[currentQuestion].options.map((option, index) => {
                      // Determine button styling based on selection and correctness
                      let btnStyle = "bg-slate-800 border-slate-600 hover:border-emerald-500 hover:bg-slate-700";
                      
                      if (selectedAnswer !== null) {
                        if (index === quizData[currentQuestion].answer) {
                          btnStyle = "bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]";
                        } else if (index === selectedAnswer) {
                          btnStyle = "bg-red-600 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]";
                        } else {
                          btnStyle = "bg-slate-900 border-slate-800 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={index}
                          disabled={selectedAnswer !== null}
                          onClick={() => handleAnswer(index)}
                          className={`p-6 rounded-2xl border-2 text-left font-bold text-lg transition-all ${btnStyle}`}
                        >
                          <span className="inline-block w-8 text-slate-400 mr-2">{['A', 'B', 'C', 'D'][index]}</span>
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback overlay */}
                  <AnimatePresence>
                    {isAnswerCorrect !== null && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full font-black text-xl border-2 shadow-2xl z-20 ${
                          isAnswerCorrect 
                            ? 'bg-emerald-900 text-emerald-400 border-emerald-500' 
                            : 'bg-red-900 text-red-400 border-red-500'
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
                      <p className="text-emerald-400 font-bold text-lg mb-8">Keahlian Pramukamu terbukti tangguh!</p>
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

                  <button 
                    onClick={quitToMap}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-xl transition-all"
                  >
                    KEMBALI KE PETA
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

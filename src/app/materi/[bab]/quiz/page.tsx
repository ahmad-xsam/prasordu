"use client";

import { useState } from 'react';
import { useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Star, Award } from 'lucide-react';
import Link from 'next/link';

export default function QuizPage({ params }: { params: { bab: string } }) {
  const babNumber = parseInt(params.bab);
  const [materi, setMateri] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch(`/api/materi-pramuka/${babNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMateri(data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load materi for quiz", err);
        setIsLoading(false);
      });
  }, [babNumber]);

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Memuat Kuis...</div>;
  }

  if (!materi || !materi.quiz || materi.quiz.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 pt-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kuis belum tersedia</h1>
          <p className="text-gray-500 mb-6">Belum ada pertanyaan kuis untuk BAB ini.</p>
          <Link href={`/materi/${babNumber}`} className="px-6 py-2 bg-primary-600 text-white rounded-lg">Kembali</Link>
        </div>
      </div>
    );
  }

  const questions = materi.quiz;
  const currentQuestion = questions[currentQuestionIdx];

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIdx]: optionIdx });
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);

    if (finalScore === 100) {
      // User passed, grant 5 stars and unlock next BAB
      const currentStars = parseInt(localStorage.getItem('pramuka_stars') || '0');
      const currentUnlocked = parseInt(localStorage.getItem('pramuka_unlocked_bab') || '1');
      
      localStorage.setItem('pramuka_stars', (currentStars + 5).toString());
      if (currentUnlocked <= babNumber) {
        localStorage.setItem('pramuka_unlocked_bab', (babNumber + 1).toString());
      }
    }
  };

  if (isSubmitted) {
    const isSuccess = score === 100;
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 pt-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
          {isSuccess ? (
            <Award className="text-yellow-500 h-24 w-24 mx-auto mb-6 animate-bounce" />
          ) : (
            <XCircle className="text-red-500 h-24 w-24 mx-auto mb-6" />
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSuccess ? 'Luar Biasa!' : 'Coba Lagi!'}
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            Nilai Anda: <span className={`font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{score}</span>/100
          </p>

          {isSuccess ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-8 inline-block">
              <p className="flex items-center justify-center font-bold text-lg gap-2">
                +5 <Star className="fill-yellow-500 text-yellow-500" /> Bintang Diperoleh!
              </p>
              <p className="text-sm mt-1">BAB {babNumber + 1} telah dibuka.</p>
            </div>
          ) : (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-8">
              <p>Anda harus menjawab semua pertanyaan dengan benar (100) untuk membuka BAB selanjutnya.</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setSelectedAnswers({});
                setCurrentQuestionIdx(0);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Ulangi Kuis
            </button>
            <Link 
              href="/materi" 
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Kembali ke Daftar Materi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/materi/${babNumber}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Materi BAB {babNumber}
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kuis BAB {materi.bab}</h1>
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Soal {currentQuestionIdx + 1} dari {questions.length}
          </div>
        </div>

        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-primary-600 h-2.5 rounded-full transition-all" 
              style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                  ${selectedAnswers[currentQuestionIdx] === idx 
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                  }
                `}
              >
                <span>{opt}</span>
                {selectedAnswers[currentQuestionIdx] === idx && (
                  <CheckCircle className="text-primary-500 h-5 w-5" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between border-t pt-6">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIdx === 0}
            className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sebelumnya
          </button>
          
          {currentQuestionIdx === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < questions.length}
              className="px-8 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Kumpulkan
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Selanjutnya
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

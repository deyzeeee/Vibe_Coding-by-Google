/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { SchoolLevel, QuizResponse, QuizQuestion } from './types';
import { generateQuiz } from './services/gemini';

export default function App() {
  const [material, setMaterial] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const [level, setLevel] = useState<SchoolLevel>('SD');
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const data = base64.split(',')[1];
          setImages(prev => [...prev, { data, mimeType: file.type, name: file.name }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!material && images.length === 0) {
      setError("Mohon masukkan bahan ajar berupa teks atau gambar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setUserAnswers({});

    try {
      const result = await generateQuiz(material, images, level);
      setQuiz(result);
      // Accessibility scroll to results
      setTimeout(() => {
        document.getElementById('quiz-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Terjadi kesalahan saat membuat kuis. Mohon coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (questionId: number, option: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col">
      {/* HEADER */}
      <header className="bg-[#0047AB] text-white p-6 md:p-8 shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <div className="bg-white text-[#0047AB] rounded-full p-4 shadow-inner">
            <GraduationCap size={56} />
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight leading-none">
              EduEase
            </h1>
            <p className="text-xl font-bold opacity-80 uppercase tracking-widest mt-1">
              Pembuat Kuis Otomatis
            </p>
          </div>
        </motion.div>
        
        <div className="text-center md:text-right">
          <p className="text-2xl font-bold">Halo, Bapak & Ibu Guru!</p>
          <p className="text-lg opacity-90 hidden md:block">Gunakan Teknologi untuk Memudahkan Pekerjaan Anda</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 md:p-10 gap-8 max-w-[1600px] mx-auto w-full">
        {/* LEFT PANEL: INPUTS */}
        <section className="lg:w-1/2 flex flex-col gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border-4 border-gray-100 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-4">
                <span className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl font-black shrink-0">1</span>
                Materi Pelajaran
              </h2>
              <button 
                onClick={() => {
                  setMaterial('');
                  setImages([]);
                  setQuiz(null);
                  setUserAnswers({});
                }}
                className="text-xl font-bold text-red-600 flex items-center gap-2 hover:bg-red-50 p-3 rounded-xl transition-colors"
                title="Hapus Semua"
              >
                <Trash2 size={28} />
                <span className="hidden sm:inline">Bersihkan</span>
              </button>
            </div>

            <textarea
              className="w-full flex-1 min-h-[300px] focus:ring-0 resize-none"
              placeholder="Tempel teks materi Anda di sini... (Contoh: Sejarah Proklamasi atau Cara Kerja Fotosintesis)"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              id="input-text"
            />

            <div className="mt-8">
              <p className="text-2xl font-black mb-4 flex items-center gap-3">
                <ImageIcon size={32} className="text-gray-500" />
                Tambah Gambar (Peta/Diagram)
              </p>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-gray-300 rounded-3xl p-8 text-center cursor-pointer hover:border-[#0047AB] hover:bg-blue-50 transition-all bg-gray-50 mb-4"
              >
                <Plus size={60} className="mx-auto text-gray-400 mb-2" />
                <p className="text-2xl font-bold text-gray-500">Klik untuk upload foto materi</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <AnimatePresence>
                  {images.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-white p-3 rounded-2xl flex items-center gap-4 border-4 border-gray-200 shadow-sm"
                    >
                      <img src={`data:${img.mimeType};base64,${img.data}`} className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={24} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border-4 border-gray-100">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-4">
              <span className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl font-black shrink-0">2</span>
              Pilih Tingkat Sekolah
            </h2>
            <select 
              value={level}
              onChange={(e) => setLevel(e.target.value as SchoolLevel)}
              className="w-full p-6 text-3xl font-bold border-4 border-gray-300 rounded-2xl bg-white focus:border-[#0047AB] appearance-none cursor-pointer"
            >
              <option value="SD">Sekolah Dasar (SD)</option>
              <option value="SMP">SMP / Sederajat</option>
              <option value="SMA">SMA / SMK / Sederajat</option>
            </select>
          </div>
        </section>

        {/* RIGHT PANEL: ACTIONS & RESULTS */}
        <section className="lg:w-1/2 flex flex-col gap-8">
          {!quiz && !isLoading && (
            <div className="flex-1 bg-[#E8F5E9] rounded-[2.5rem] p-10 shadow-xl border-4 border-[#2E7D32] border-dashed flex flex-col items-center justify-center text-center">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-8 p-10 bg-white rounded-full text-[#2E7D32] shadow-lg border-4 border-[#A5D6A7]"
              >
                <FileText size={100} />
              </motion.div>
              <h3 className="text-4xl md:text-5xl font-black text-[#1B5E20] mb-6">Hasil Kuis Muncul di Sini</h3>
              <p className="text-2xl text-gray-700 leading-relaxed font-bold opacity-80 max-w-lg">
                Setelah Bapak/Ibu menekan tombol di bawah, kuis 5 soal pilihan ganda beserta kunci jawaban akan dibuat secara otomatis.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 bg-white rounded-[2.5rem] p-10 shadow-xl border-4 border-blue-100 flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin text-[#0047AB] mb-8" size={120} />
              <h3 className="text-4xl font-black text-[#0047AB] mb-4">Sedang Belajar...</h3>
              <p className="text-2xl text-gray-600 font-bold">AI kami sedang membaca materi Bapak/Ibu dan membuat soal-soal terbaik.</p>
            </div>
          )}

          {error && (
            <div className="p-8 bg-red-50 border-4 border-red-600 text-red-700 text-2xl font-bold rounded-[2rem] flex items-center gap-6 shadow-lg">
              <XCircle size={60} className="shrink-0" />
              <div>
                <p className="text-3xl font-black">Waduh, Ada Masalah!</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {quiz && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="bg-white border-8 border-[#0047AB] rounded-[3rem] p-8 md:p-12 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-10 pb-6 border-b-4 border-gray-100">
                    <h2 className="text-4xl md:text-5xl font-black text-[#0047AB]">
                      Hasil Kuis
                    </h2>
                    <span className="bg-blue-100 text-[#0047AB] px-6 py-2 rounded-full text-2xl font-black">
                      {level}
                    </span>
                  </div>
                  
                  <h4 className="text-3xl font-bold mb-12 text-gray-800 text-center italic">
                    "{quiz.quizTitle}"
                  </h4>

                  <div className="space-y-12">
                    {quiz.questions.map((q, qIdx) => (
                      <div key={q.id} className="pb-8 border-b-2 border-gray-100 last:border-0">
                        <h3 className="text-3xl font-black mb-8 flex gap-4 text-gray-900">
                          <span className="bg-[#0047AB] text-white rounded-xl w-12 h-12 flex items-center justify-center shrink-0 text-2xl">
                            {qIdx + 1}
                          </span>
                          {q.question}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = userAnswers[q.id] === opt;
                            const isCorrect = userAnswers[q.id] && opt === q.correctAnswer;
                            const isWrong = isSelected && opt !== q.correctAnswer;

                            return (
                              <button
                                key={oIdx}
                                onClick={() => selectAnswer(q.id, opt)}
                                className={`text-left p-6 text-2xl font-bold rounded-2xl border-4 transition-all flex justify-between items-center ${
                                  isSelected 
                                    ? (isCorrect ? 'bg-green-100 border-green-600 text-green-800' : isWrong ? 'bg-red-100 border-red-600 text-red-800' : 'bg-[#0047AB] text-white border-black shadow-lg')
                                    : 'bg-gray-50 border-gray-200 hover:border-gray-400 hover:bg-white'
                                }`}
                              >
                                <span>{opt}</span>
                                {userAnswers[q.id] && opt === q.correctAnswer && <CheckCircle2 className="text-green-600" size={36} />}
                                {isWrong && <XCircle className="text-red-600" size={36} />}
                              </button>
                            );
                          })}
                        </div>
                        
                        <AnimatePresence>
                          {userAnswers[q.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-6 p-6 bg-blue-50 border-l-8 border-[#0047AB] rounded-r-2xl shadow-sm"
                            >
                              <p className="text-xl font-bold text-gray-700">
                                <span className="text-[#0047AB] font-black underline">Kunci & Penjelasan:</span><br/>
                                Jawaban: <span className="text-green-700">{q.correctAnswer}</span><br/>
                                {q.explanation}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { setQuiz(null); setUserAnswers({}); }}
                    className="w-full mt-12 py-8 text-2xl font-black bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors border-2 border-gray-200"
                  >
                    BUAT KUIS BARU
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full py-10 rounded-[2.5rem] text-4xl md:text-5xl font-black flex flex-col items-center justify-center gap-2 shadow-2xl transform transition-all active:scale-95 ${
              isLoading || quiz 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-4 border-gray-300' 
                : 'bg-[#1B5E20] hover:bg-[#2E7D32] text-white border-4 border-[#0D3B0F]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={60} />
                <span className="text-2xl uppercase font-bold tracking-widest">Sabar ya, sedang diproses...</span>
              </>
            ) : quiz ? (
              <>
                <CheckCircle2 size={60} />
                <span className="text-2xl uppercase font-bold tracking-widest">Kuis Selesai!</span>
              </>
            ) : (
              <>
                BUAT KUIS SEKARANG
                <span className="text-xl font-bold opacity-80 uppercase tracking-widest">Proses Cepat & Mudah</span>
              </>
            )}
          </button>
        </section>
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-white border-t-4 border-gray-200 p-8 text-center mt-auto">
        <p className="text-2xl font-bold text-gray-500">
          Butuh Bantuan? Hubungi kami di: <span className="text-[#0047AB] underline font-black">0812-3456-7890</span> (WhatsApp Guru)
        </p>
      </footer>
    </div>
  );
}

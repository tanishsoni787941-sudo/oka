import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MessageSquare, Send, X, Bot, Loader2, Minus, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const QUICK_QUESTIONS = [
  { label: "How to start mushroom farming?", query: "How to start mushroom farming? Please give a step-by-step guide." },
  { label: "Compost kaise banaye?", query: "Mushroom ke liye compost kaise banaye? Step-by-step process batayein Hindi aur English mix mein." },
  { label: "Temperature kitna hona chahiye?", query: "Mushroom cultivation ke liye ideal temperature aur humidity kitni honi chahiye?" },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Namaste! Main Organic Mushroom Farm ka expert assistant hoon. Main aapko mushroom cultivation ke har step mein guide karunga—chahe wo compost banana ho, spawning ho, ya harvesting. Aap mujhse cost, setup, ya kisi bhi problem ke baare mein pooch sakte hain. Kaise shuru karein? 😊' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text }]
          }
        ],
        config: {
          systemInstruction: `You are an expert Organic Mushroom Farming Assistant for a training platform called "Organic Mushroom Farm". 
          Your role is to guide users (farmers, beginners, and students) step-by-step in mushroom cultivation.
          
          Your responsibilities:
          1. Explain mushroom farming in simple, practical language.
          2. Provide step-by-step cultivation methods (compost, spawning, incubation, harvesting).
          3. Suggest required equipment and setup (low-cost and professional both).
          4. Give cost, profit estimation, and business guidance.
          5. Identify and solve common problems (diseases, contamination, low yield).
          6. Recommend best mushroom types (Oyster, Button, Milky) based on season and location.
          7. Provide daily routine and training guidance.
          8. Help users scale from small farming to commercial level.
          
          Behavior rules:
          - Always respond in a clear, structured format.
          - Use bullet points or steps wherever possible.
          - Keep answers practical, not theoretical.
          - If user asks in Hindi, reply in Hindi.
          - If user asks in English, reply in English.
          - Be friendly but professional like an agriculture trainer.
          
          Extra features:
          - If user asks about "cost", give approximate Indian pricing (₹).
          - If user asks "how to start", give beginner roadmap.
          - If user asks "problem", give cause + solution.
          
          Avoid:
          - Do not give vague or generic answers.
          - Do not say "consult expert" — YOU are the expert.
          - Do not go off-topic.`,
        }
      });

      const modelMessage: Message = { role: 'model', text: response.text || "Maaf kijiye, main abhi samajh nahi pa raha hoon. Kripya phir se poochiye." };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Network error! Kripya check karein ki aapka internet theek hai." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-purple-700 transition-all glow-purple hover:scale-110 active:scale-95"
          >
            <Bot className="h-8 w-8" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`glass-card rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${
              isMinimized ? 'h-16 w-72' : 'h-[600px] w-[400px] max-w-[90vw]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Mushroom Expert AI</h3>
                  {!isMinimized && <p className="text-[10px] text-purple-100">Always Online</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-stone-900/50">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-purple-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-sm border border-stone-100 dark:border-stone-700 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-stone-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-stone-100 dark:border-stone-700">
                        <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Buttons */}
                <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-x-auto flex gap-2 no-scrollbar">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q.query)}
                      className="whitespace-nowrap px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full text-xs font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="h-10 w-10 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-200 dark:shadow-none"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

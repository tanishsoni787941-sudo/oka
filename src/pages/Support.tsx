import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MessageCircle, MapPin, Send, ChevronDown, ChevronUp, CheckCircle, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Support() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods = [
    { name: 'Phone Support', value: '9203544140', icon: <Phone className="h-6 w-6" />, url: 'tel:9203544140', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { name: 'WhatsApp', value: '919203544140', icon: <MessageCircle className="h-6 w-6" />, url: 'https://wa.me/919203544140', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { name: 'Email Us', value: 'sonib491@gmail.com', icon: <Mail className="h-6 w-6" />, url: 'mailto:sonib491@gmail.com', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { name: 'Location', value: 'Jabalpur, Madhya Pradesh', icon: <MapPin className="h-6 w-6" />, url: 'https://maps.google.com/?q=Jabalpur', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);

    const newMessage = {
      name,
      email,
      message,
      date: Date.now(),
      read: false
    };

    try {
      await addDoc(collection(db, 'messages'), newMessage);
      
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-4">
            Contact & <span className="text-purple-600">Support</span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 leading-relaxed">
            Have questions or need assistance? Our support team is here to help you every step of the way.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.name}
              href={method.url}
              target={method.url.startsWith('http') ? '_blank' : undefined}
              rel={method.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${method.color}`}>
                {method.icon}
              </div>
              <div>
                <div className="text-stone-500 dark:text-stone-500 font-bold uppercase tracking-wider text-xs mb-1">{method.name}</div>
                <div className="text-xl font-bold text-stone-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{method.value}</div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm"
          >
            {showForm ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            {showForm ? 'Hide Contact Form' : 'Send us a Message'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-stone-900 p-8 sm:p-12 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm mb-16">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-8">Send us a Message</h2>
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-stone-600 dark:text-stone-400">Thank you for reaching out. We'll get back to you soon.</p>
                  </motion.div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700 dark:text-stone-300 ml-1">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-5 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700 dark:text-stone-300 ml-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full px-5 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700 dark:text-stone-300 ml-1">Message</label>
                      <textarea 
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help you?"
                        className="w-full px-5 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

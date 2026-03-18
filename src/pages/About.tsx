import React from 'react';
import { motion } from 'motion/react';
import { Sprout, Users, Award, Globe } from 'lucide-react';

export default function About() {
  const stats = [
    { label: 'Students Trained', value: '5000+', icon: <Users className="h-6 w-6" /> },
    { label: 'Years Experience', value: '10+', icon: <Award className="h-6 w-6" /> },
    { label: 'Global Reach', value: '15+', icon: <Globe className="h-6 w-6" /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sprout className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-4">
            About <span className="text-purple-600">Organic Mushroom Farm</span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 leading-relaxed">
            We are dedicated to providing high-quality training and resources for mushroom cultivation. Our mission is to empower farmers with sustainable and profitable farming techniques.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 text-center shadow-sm"
            >
              <div className="text-purple-600 dark:text-purple-400 flex justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-stone-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-stone-500 dark:text-stone-500 font-medium uppercase tracking-wider text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg">
              To be the leading platform for mushroom farming education, fostering a global community of successful organic farmers who contribute to sustainable agriculture and food security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">Our Story</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg">
              Founded in Jabalpur, Organic Mushroom Farm started as a small initiative to help local farmers diversify their income. Over the years, we have grown into a comprehensive online platform, reaching thousands of aspiring farmers across the country and beyond.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

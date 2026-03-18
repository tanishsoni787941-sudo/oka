import React from 'react';
import { Phone, Mail, Instagram, Facebook, Youtube, Pin as Pinterest, MessageCircle } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/organic_mushroom_farm_jabalpur', icon: <Instagram className="h-5 w-5" /> },
    { name: 'Facebook', url: 'https://www.facebook.com/organic.mushroom.farm0', icon: <Facebook className="h-5 w-5" /> },
    { name: 'YouTube', url: 'https://www.youtube.com/@organicmushroomfarm', icon: <Youtube className="h-5 w-5" /> },
    { name: 'Pinterest', url: 'https://www.pinterest.com/organicmushroomfarm', icon: <Pinterest className="h-5 w-5" /> },
  ];

  return (
    <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
                Organic Mushroom <span className="text-purple-600">Farm</span>
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Empowering farmers with the knowledge and tools to cultivate high-quality organic mushrooms. Join our community and start your journey today.
            </p>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Support</h3>
            <div className="space-y-3">
              <a 
                href="tel:9203544140" 
                className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Phone className="h-5 w-5" />
                9203544140
              </a>
              <a 
                href="https://wa.me/919203544140" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp Support
              </a>
              <a 
                href="mailto:sonib491@gmail.com" 
                className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
                sonib491@gmail.com
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Follow Us</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl flex items-center justify-center hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-stone-500 dark:text-stone-500 text-sm">
            © {new Date().getFullYear()} Organic Mushroom Farm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

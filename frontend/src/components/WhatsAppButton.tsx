import React from 'react';
import { getWhatsAppLink } from '../utils';

/**
 * Floating "chat on WhatsApp" button, fixed to the bottom-right corner on
 * every page. Opens a real WhatsApp chat with SK Cakes (wa.me link) in a
 * new tab - no SDK or app install required on the visitor's side.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppLink("Hi SK Cakes! I'd like to ask about your cakes 🎂")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with SK Cakes on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg shadow-black/20 pl-3 pr-4 py-3 transition-all hover:scale-105 active:scale-95"
    >
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 flex-shrink-0"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.354.615 4.62 1.782 6.62L2.667 29.333l6.87-1.802a13.27 13.27 0 0 0 6.467 1.646h.006c7.362 0 13.332-5.97 13.332-13.333 0-3.562-1.387-6.912-3.905-9.43a13.246 13.246 0 0 0-9.433-3.747Zm0 24.4h-.005a11.05 11.05 0 0 1-5.632-1.542l-.404-.24-4.077 1.069 1.088-3.975-.264-.408a11.02 11.02 0 0 1-1.688-5.87c0-6.1 4.965-11.065 11.067-11.065a11 11 0 0 1 7.826 3.244 10.99 10.99 0 0 1 3.24 7.826c0 6.101-4.966 11.061-11.15 11.061Zm6.067-8.284c-.332-.167-1.966-.97-2.27-1.08-.305-.111-.526-.166-.748.167-.221.333-.858 1.08-1.052 1.302-.194.222-.388.25-.72.084-.333-.167-1.405-.518-2.676-1.65-.989-.882-1.658-1.972-1.852-2.305-.194-.333-.02-.513.147-.679.15-.15.333-.389.5-.583.166-.194.221-.333.332-.555.111-.222.056-.417-.028-.583-.083-.167-.747-1.802-1.024-2.469-.27-.65-.544-.562-.747-.572a13.9 13.9 0 0 0-.638-.012.99.99 0 0 0-.72.334c-.222.222-1.11 1.083-1.11 2.638 0 1.556 1.135 3.056 1.294 3.269.166.222 2.235 3.413 5.417 4.786.757.327 1.348.523 1.809.669.76.242 1.451.208 1.998.126.61-.091 1.966-.803 2.243-1.58.277-.777.277-1.442.194-1.58-.083-.139-.305-.222-.638-.389Z" />
      </svg>
      <span className="text-sm font-bold hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}

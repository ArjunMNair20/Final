import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import ChatBot from './ChatBot';

export default function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(8,247,254,0.3)] hover:shadow-[0_0_30px_rgba(8,247,254,0.5)] transition-all hover:scale-110 group"
        aria-label="Open AI Chatbot"
      >
        <Bot className="text-cyan-400 group-hover:text-cyan-300 transition-colors" size={28} />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] flex flex-col shadow-2xl">
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border-2 border-cyan-400/50">
        <ChatBot onClose={() => setIsOpen(false)} isModal={false} />
      </div>
    </div>
  );
}


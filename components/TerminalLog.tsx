import React, { useEffect, useRef } from 'react';
import { Message, MessageSender } from '../types';

interface TerminalLogProps {
  messages: Message[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl flex-1 overflow-y-auto px-4 py-2 space-y-3 mask-image-linear-gradient-to-t mb-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex flex-col ${msg.sender === MessageSender.USER ? 'items-end' : 'items-start'}`}
        >
          <div 
            className={`max-w-[80%] p-3 rounded-sm border-l-2 ${
              msg.sender === MessageSender.USER 
                ? 'border-cyan-500 bg-cyan-950/30 text-right text-cyan-100' 
                : 'border-red-500 bg-red-950/20 text-left text-red-100'
            }`}
          >
             <span className="text-[10px] uppercase opacity-50 block mb-1 tracking-widest font-bold">
               {msg.sender === MessageSender.USER ? 'CMD://USER' : 'SYS://ROX'}
             </span>
             <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default TerminalLog;
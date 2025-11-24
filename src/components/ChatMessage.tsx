import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isBot = message.role === 'assistant';
  
  return (
    <div 
      className={cn(
        "flex gap-3 mb-4 animate-fade-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-6 h-6 text-primary" />
        </div>
      )}
      
      <div 
        className={cn(
          "max-w-[75%] rounded-2xl px-5 py-3 shadow-sm",
          isBot 
            ? "bg-secondary text-secondary-foreground rounded-tl-none" 
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}
      >
        <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <span className={cn(
          "text-xs mt-2 block opacity-70",
          isBot ? "text-muted-foreground" : "text-primary-foreground"
        )}>
          {message.timestamp.toLocaleTimeString('nl-NL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {!isBot && (
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

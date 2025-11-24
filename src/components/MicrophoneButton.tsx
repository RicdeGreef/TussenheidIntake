import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MicrophoneState = 'idle' | 'recording' | 'processing' | 'speaking';

interface MicrophoneButtonProps {
  state: MicrophoneState;
  onToggleRecording: () => void;
  disabled?: boolean;
}

export const MicrophoneButton = ({ 
  state, 
  onToggleRecording,
  disabled = false 
}: MicrophoneButtonProps) => {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';
  
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Status Text */}
      <div className="h-6">
        {isRecording && (
          <p className="text-sm font-medium text-recording animate-pulse-recording">
            Aan het luisteren...
          </p>
        )}
        {isProcessing && (
          <p className="text-sm font-medium text-muted-foreground">
            Even verwerken...
          </p>
        )}
        {isSpeaking && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 h-6 bg-primary rounded-full animate-wave"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-primary">
              Aan het spreken...
            </p>
          </div>
        )}
      </div>
      
      {/* Microphone Button */}
      <Button
        onClick={onToggleRecording}
        disabled={disabled || isProcessing || isSpeaking}
        size="lg"
        className={cn(
          "w-20 h-20 rounded-full shadow-lg transition-all duration-300 relative",
          isRecording 
            ? "bg-recording hover:bg-recording/90 animate-pulse-recording glow-primary" 
            : "bg-primary hover:bg-primary/90",
          (isProcessing || isSpeaking) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : isRecording ? (
          <Square className="w-10 h-10" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </Button>
      
      {/* Help Text */}
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {isRecording 
          ? "Klik om te stoppen" 
          : "Klik op de microfoon en spreek uw antwoord in"}
      </p>
    </div>
  );
};

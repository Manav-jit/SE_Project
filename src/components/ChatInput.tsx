import { Send, Mic, Paperclip } from 'lucide-react';
import { FormEvent, useRef, useEffect, useState } from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onFileUpload: () => void;
  language: string;
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading, onFileUpload, language }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange({ target: { value: input ? input + ' ' + transcript : transcript } });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload();
      // Reset input
      e.target.value = '';
    }
  };

  const placeholderText = language === 'hi' ? 'अपना संदेश यहाँ टाइप करें...' : 'Type your message here...';

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative flex items-center w-full bg-card border-2 border-foreground rounded-[16px] shadow-[4px_4px_0px_0px_var(--foreground)] focus-within:shadow-[6px_6px_0px_0px_var(--foreground)] focus-within:translate-y-[-2px] transition-all p-2 mt-4 gap-2"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf" 
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        title="Upload Document for Scanning"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={input || ''}
        onChange={handleInputChange as any}
        placeholder={placeholderText}
        disabled={isLoading}
        className="flex-1 bg-transparent border-none outline-none px-2 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
      />
      
      <button
        type="button"
        onClick={startRecording}
        disabled={isLoading || isRecording}
        className={`p-2.5 rounded-lg transition-colors shrink-0 ${isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed'}`}
        title="Voice Input"
      >
        <Mic className="w-5 h-5" />
      </button>

      <button
        type="submit"
        disabled={isLoading || !(input || '').trim()}
        className="p-2.5 organic-button flex items-center justify-center shrink-0 ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}

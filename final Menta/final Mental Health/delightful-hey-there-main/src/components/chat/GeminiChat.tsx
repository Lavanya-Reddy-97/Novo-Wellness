import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, X, MessageCircle, Mic, MicOff } from 'lucide-react';
import { generateResponse } from '@/services/geminiService';

// SpeechRecognition interfaces
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): ISpeechRecognition;
      prototype: ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
      prototype: ISpeechRecognition;
    };
  }
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
};

// Memoized message component to prevent unnecessary re-renders
const ChatMessage = memo(({ message }: { message: Message }) => (
  <div className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div 
        className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
          message.role === 'user' ? 'bg-teal-500 ml-2' : 'bg-gray-300 mr-2'
        }`}
        aria-hidden="true"
      >
        {message.role === 'user' ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-gray-700" />
        )}
      </div>
      <div 
        className={`p-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-teal-100 text-gray-800 rounded-tr-none' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
        }`}
        aria-live={message.role === 'assistant' ? 'polite' : 'off'}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.status === 'error' && (
          <p className="text-xs text-red-500 mt-1">Failed to send. Please try again.</p>
        )}
      </div>
    </div>
  </div>
));

// Loading indicator component
const LoadingDots = () => (
  <div className="flex space-x-2">
    {[0, 150, 300].map((delay) => (
      <div 
        key={delay}
        className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" 
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);

export const GeminiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'initial-message',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<number | null>(null);

  // Check if speech recognition is available
  useEffect(() => {
    setHasSpeechRecognition(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!hasSpeechRecognition) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        // Debounce updates to prevent excessive re-renders
        if (debounceTimer.current) {
          window.clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = window.setTimeout(() => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // Update the input with the latest transcript
          setInput(prev => {
            if (finalTranscript) {
              return prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript;
            }
            return interimTranscript || prev;
          });
        }, 300); // 300ms debounce
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Provide user feedback for common errors
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone access to use voice input.');
        } else if (event.error === 'audio-capture') {
          alert('No microphone was found. Please ensure a microphone is connected.');
        }
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting speech recognition:', error);
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
      
      return () => {
        if (debounceTimer.current) {
          window.clearTimeout(debounceTimer.current);
        }
        recognition.stop();
      };
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setHasSpeechRecognition(false);
    }
  }, [isListening, hasSpeechRecognition]);

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current || !hasSpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setInput('');
        recognitionRef.current.start();
        setIsListening(true);
        // Focus the input after starting voice recognition
        inputRef.current?.focus();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
      }
    }
  }, [isListening, hasSpeechRecognition]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = input.trim();
    if (!messageContent || isLoading) return;

    // Create a user message with a unique ID and timestamp
    const userMessage: Message = { 
      id: `msg-${Date.now()}`,
      role: 'user', 
      content: messageContent,
      timestamp: Date.now(),
      status: 'sending'
    };

    // Optimistically update the UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format messages for the API, skipping the initial assistant message
      const formattedHistory = messages
        .filter((msg, index) => index > 0) // Skip the first message (initial greeting)
        .map(({ role, content }) => ({ role, content }));
      
      const response = await generateResponse(messageContent, formattedHistory);
      
      // Update the message with the response
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== userMessage.id),
        { ...userMessage, status: 'sent' },
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== userMessage.id),
        { 
          ...userMessage, 
          status: 'error',
          content: messageContent // Keep the original message content
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus the input after sending a message
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  // Memoize the chat toggle button
  const chatToggleButton = useMemo(() => (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  ), []);

  if (!isOpen) {
    return chatToggleButton;
  }

  return (
    <>
      {/* Overlay: covers the screen except the chat, closes chat on click */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 cursor-pointer"
        onClick={() => setIsOpen(false)}
        aria-label="Close chat overlay"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      />
      <div 
        className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[600px] flex flex-col bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out"
        role="dialog"
        aria-labelledby="chat-title"
        aria-modal="true"
      >
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <h2 id="chat-title" className="text-lg font-semibold">Novo AI</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-teal-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Chat messages container */}
        <div 
          className="flex-1 overflow-y-auto p-4" 
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions"
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex items-center justify-start mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-gray-700" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-3">
                <LoadingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
        
        {/* Message input form */}
        <form 
          onSubmit={handleSubmit} 
          className="p-4 border-t border-gray-200 bg-white"
          aria-label="Chat input form"
        >
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  hasSpeechRecognition 
                    ? isListening 
                      ? 'Listening...' 
                      : 'Type your message or click mic...'
                    : 'Type your message...'
                }
                className="w-full pr-10 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isLoading || (isListening && !hasSpeechRecognition)}
                aria-label="Type your message"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              {hasSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isListening 
                      ? 'text-red-500 animate-pulse' 
                      : 'text-gray-500 hover:text-teal-600'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  disabled={isLoading}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          {!hasSpeechRecognition && (
            <p className="text-xs text-gray-500 mt-2">
              Voice input is not supported in your browser. Try using Chrome or Edge.
            </p>
          )}
        </form>
      </div>
    </>
  );
};

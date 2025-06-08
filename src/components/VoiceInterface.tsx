import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle,
  Loader2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { elevenLabsService } from '../lib/elevenlabs';
import toast from 'react-hot-toast';

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  context?: 'flowchart' | 'code' | 'general';
  className?: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onTranscript, 
  context = 'general',
  className = '' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startListening = () => {
    if (isListening) return;

    setIsListening(true);
    setTranscript('');
    
    recognitionRef.current = elevenLabsService.startSpeechRecognition(
      (result) => {
        setTranscript(result);
        setIsListening(false);
        handleVoiceInput(result);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        
        // Provide specific error messages based on error type
        if (error === 'network') {
          toast.error('Speech recognition service could not be reached. Please check your internet connection and try again.');
        } else if (error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions and try again.');
        } else if (error === 'no-speech') {
          toast.error('No speech detected. Please speak clearly and try again.');
        } else if (error === 'audio-capture') {
          toast.error('Microphone not available. Please check your microphone and try again.');
        } else if (error === 'service-not-allowed') {
          toast.error('Speech recognition service not available. Please try again later.');
        } else {
          toast.error('Speech recognition failed. Please try again.');
        }
        
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleVoiceInput = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Send transcript to parent component
      onTranscript(text);
      
      // Generate conversational response
      const response = elevenLabsService.generateResponse(text, context);
      setLastResponse(response);
      
      // Speak the response if audio is enabled
      if (audioEnabled) {
        await speakText(response);
      }
      
      toast.success('Voice command processed!');
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('Failed to process voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    if (!audioEnabled || isSpeaking) return;
    
    setIsSpeaking(true);
    
    try {
      const audioBuffer = await elevenLabsService.textToSpeech(text);
      await elevenLabsService.playAudio(audioBuffer);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  };

  const repeatLastResponse = () => {
    if (lastResponse && audioEnabled) {
      speakText(lastResponse);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking && !audioEnabled) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`voice-interface ${className}`}>
      {/* Compact Voice Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        
        {/* Listening indicator */}
        {isListening && (
          <motion.div
            className="absolute -inset-1 bg-red-500 rounded-full opacity-50"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <motion.div
            className="absolute -inset-1 bg-green-500 rounded-full opacity-50"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Expanded Voice Interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 bg-card-gradient backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 w-80 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Voice Assistant</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Voice Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <motion.button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isSpeaking}
                className={`p-4 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isListening ? (
                  <MicOff className="h-6 w-6 text-white" />
                ) : (
                  <Mic className="h-6 w-6 text-white" />
                )}
              </motion.button>

              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-all duration-300 ${
                  audioEnabled 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                {audioEnabled ? (
                  <Volume2 className="h-5 w-5 text-white" />
                ) : (
                  <VolumeX className="h-5 w-5 text-white" />
                )}
              </button>

              {lastResponse && (
                <button
                  onClick={repeatLastResponse}
                  disabled={isSpeaking}
                  className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 transition-all duration-300 disabled:opacity-50"
                >
                  <RotateCcw className="h-5 w-5 text-white" />
                </button>
              )}
            </div>

            {/* Status Display */}
            <div className="space-y-3">
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              )}

              {isListening && (
                <div className="flex items-center space-x-2 text-red-400">
                  <motion.div
                    className="w-2 h-2 bg-red-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-sm">Listening...</span>
                </div>
              )}

              {isSpeaking && (
                <div className="flex items-center space-x-2 text-green-400">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <span className="text-sm">Speaking...</span>
                </div>
              )}

              {transcript && (
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">You said:</p>
                  <p className="text-sm text-white">{transcript}</p>
                </div>
              )}

              {lastResponse && (
                <div className="bg-purple-500/20 rounded-lg p-3">
                  <p className="text-xs text-purple-400 mb-1">Assistant:</p>
                  <p className="text-sm text-white">{lastResponse}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              <p className="text-xs text-gray-400 mb-2">Quick commands:</p>
              <div className="space-y-1 text-xs text-gray-300">
                <div>"Create a flowchart for user login"</div>
                <div>"Generate code for a REST API"</div>
                <div>"Help me with authentication flow"</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInterface;
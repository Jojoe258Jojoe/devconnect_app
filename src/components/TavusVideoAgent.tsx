import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  MessageCircle,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  User,
  Bot,
  Loader2,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import { tavusService, type TavusConversation, type TavusMessage, type TavusReplica } from '../lib/tavus';
import { deepSeekService } from '../lib/deepseek';
import toast from 'react-hot-toast';

interface TavusVideoAgentProps {
  context?: 'flowchart' | 'code' | 'collaboration' | 'general';
  onMessage?: (message: string) => void;
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const TavusVideoAgent: React.FC<TavusVideoAgentProps> = ({
  context = 'general',
  onMessage,
  className = '',
  minimized = false,
  onToggleMinimize
}) => {
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [messages, setMessages] = useState<TavusMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [replicas, setReplicas] = useState<TavusReplica[]>([]);
  const [selectedReplica, setSelectedReplica] = useState<string>('');
  const [initializationError, setInitializationError] = useState<string>('');
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeTavus();
    return () => {
      if (conversation) {
        handleEndConversation();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeTavus = async () => {
    try {
      setInitializationError('');
      const initialized = await tavusService.initialize();
      
      if (initialized) {
        const availableReplicas = await tavusService.getReplicas();
        console.log('Available replicas:', availableReplicas);
        
        setReplicas(availableReplicas);
        
        if (availableReplicas.length > 0) {
          // Find an active replica or use the first one
          const activeReplica = availableReplicas.find(r => r.status === 'ready' || r.status === 'active');
          const replicaToUse = activeReplica || availableReplicas[0];
          setSelectedReplica(replicaToUse.replica_id);
        } else {
          setInitializationError('No AI agents available. Please check your Tavus account.');
        }
      } else {
        setInitializationError('Failed to connect to Tavus service. Please check your API key.');
      }
    } catch (error) {
      console.error('Tavus initialization error:', error);
      setInitializationError('Failed to initialize video agent service. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartConversation = async () => {
    if (!selectedReplica) {
      toast.error('No AI agent selected');
      return;
    }

    setIsConnecting(true);
    
    try {
      const newConversation = await tavusService.createConversation({
        replicaId: selectedReplica,
        properties: {
          max_call_duration: 1800, // 30 minutes
          language: 'English'
        }
      });
      
      if (newConversation) {
        setConversation(newConversation);
        setIsConnected(true);
        
        // Set up message handler
        tavusService.onMessage(newConversation.conversationId, (message) => {
          setMessages(prev => [...prev, message]);
          if (onMessage && message.type === 'replica') {
            onMessage(message.content);
          }
        });

        // Add welcome message using DeepSeek AI
        try {
          const welcomeContent = await deepSeekService.generateConversationalResponse(
            `Welcome the user to the ${context} assistant. Be brief and helpful.`,
            context
          );
          
          const welcomeMessage: TavusMessage = {
            type: 'replica',
            content: welcomeContent,
            timestamp: Date.now()
          };
          setMessages([welcomeMessage]);
        } catch (error) {
          // Fallback welcome message
          const welcomeMessage: TavusMessage = {
            type: 'replica',
            content: getWelcomeMessage(context),
            timestamp: Date.now()
          };
          setMessages([welcomeMessage]);
        }
        
        toast.success('Connected to AI video agent!');
      } else {
        toast.error('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to connect to AI agent. Please check your connection.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndConversation = async () => {
    if (!conversation) return;

    try {
      await tavusService.endConversation(conversation.conversationId);
      tavusService.offMessage(conversation.conversationId);
      setConversation(null);
      setIsConnected(false);
      setMessages([]);
      toast.success('Conversation ended');
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error('Failed to end conversation properly');
    }
  };

  const handleSendMessage = async () => {
    if (!conversation || !inputMessage.trim()) return;

    const userMessage: TavusMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Generate AI response using DeepSeek
      const aiResponse = await deepSeekService.generateConversationalResponse(inputMessage, context);
      
      const aiMessage: TavusMessage = {
        type: 'replica',
        content: aiResponse,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (onMessage) {
        onMessage(aiResponse);
      }
      
      // Also send to Tavus if available
      const success = await tavusService.sendMessage(conversation.conversationId, inputMessage);
      if (!success) {
        console.warn('Failed to send message to Tavus, but AI response generated');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to process message');
    }
    
    setInputMessage('');
  };

  const getWelcomeMessage = (context: string): string => {
    const messages = {
      flowchart: "Hi! I'm your AI assistant for flowchart creation. I can help you design process flows, system architectures, and visual diagrams. What would you like to create today?",
      code: "Hello! I'm here to help you with coding. Whether you need help writing code, debugging, or understanding concepts, I'm ready to assist. What are you working on?",
      collaboration: "Welcome! I'm your collaboration assistant. I can help you connect with other developers, manage projects, and facilitate teamwork. How can I help you collaborate better?",
      general: "Hi there! I'm your AI assistant for all things software development. I can help with coding, architecture, collaboration, and more. What can I help you with today?"
    };
    return messages[context] || messages.general;
  };

  const getContextIcon = () => {
    switch (context) {
      case 'flowchart': return '🔄';
      case 'code': return '💻';
      case 'collaboration': return '🤝';
      default: return '🤖';
    }
  };

  if (minimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <button
          onClick={onToggleMinimize}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <Video className="h-8 w-8 text-white" />
          {isConnected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-card-gradient backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl ${
        isFullscreen ? 'fixed inset-4 z-50' : 'w-96 h-[600px]'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-lg">{getContextIcon()}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Video Agent</h3>
            <p className="text-gray-400 text-sm capitalize">{context} Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="relative bg-dark-900 h-64 flex items-center justify-center">
        {isConnected && conversation ? (
          <iframe
            ref={videoRef}
            src={conversation.conversationUrl}
            className="w-full h-full rounded-lg"
            allow="camera; microphone; autoplay"
            title="Tavus AI Video Agent"
          />
        ) : (
          <div className="text-center p-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-10 w-10 text-white" />
            </div>
            
            {initializationError ? (
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm mb-4">{initializationError}</p>
                <button
                  onClick={initializeTavus}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-4">AI Video Agent Ready</p>
                {replicas.length > 0 && (
                  <select
                    value={selectedReplica}
                    onChange={(e) => setSelectedReplica(e.target.value)}
                    className="mb-4 bg-dark-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    {replicas.map((replica) => (
                      <option key={replica.replica_id} value={replica.replica_id}>
                        {replica.replica_name || `Agent ${replica.replica_id.slice(0, 8)}`}
                        {replica.status && ` (${replica.status})`}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 p-4 border-b border-blue-500/20">
        {!isConnected ? (
          <button
            onClick={handleStartConversation}
            disabled={isConnecting || replicas.length === 0 || !!initializationError}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Phone className="h-4 w-4" />
                <span>Start Call</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isMuted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
            </button>
            
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-3 rounded-full transition-colors ${
                !isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isVideoEnabled ? <Video className="h-4 w-4 text-white" /> : <VideoOff className="h-4 w-4 text-white" />}
            </button>
            
            <button
              onClick={handleEndConversation}
              className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              <PhoneOff className="h-4 w-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-48">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.type === 'user' ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
                <span className="text-xs opacity-75">
                  {message.type === 'user' ? 'You' : 'AI Agent'}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {isConnected && (
        <div className="p-4 border-t border-blue-500/20">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-dark-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TavusVideoAgent;
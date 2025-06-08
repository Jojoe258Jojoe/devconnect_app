import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Play, 
  Copy, 
  Download, 
  Settings, 
  Zap,
  FileText,
  Terminal,
  Sparkles,
  ChevronDown,
  Mic,
  Video
} from 'lucide-react';
import VoiceInterface from '../components/VoiceInterface';
import TavusVideoAgent from '../components/TavusVideoAgent';
import { deepSeekService } from '../lib/deepseek';
import toast from 'react-hot-toast';

const CodeGenerator = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [selectedFramework, setSelectedFramework] = useState('react');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVideoAgent, setShowVideoAgent] = useState(false);
  const [videoAgentMinimized, setVideoAgentMinimized] = useState(false);

  const languages = [
    { id: 'javascript', name: 'JavaScript', color: 'from-yellow-400 to-yellow-600' },
    { id: 'typescript', name: 'TypeScript', color: 'from-blue-400 to-blue-600' },
    { id: 'python', name: 'Python', color: 'from-green-400 to-green-600' },
    { id: 'java', name: 'Java', color: 'from-red-400 to-red-600' },
    { id: 'csharp', name: 'C#', color: 'from-purple-400 to-purple-600' },
    { id: 'go', name: 'Go', color: 'from-cyan-400 to-cyan-600' },
    { id: 'rust', name: 'Rust', color: 'from-orange-400 to-orange-600' },
    { id: 'php', name: 'PHP', color: 'from-indigo-400 to-indigo-600' }
  ];

  const frameworks = {
    javascript: ['React', 'Vue.js', 'Angular', 'Node.js', 'Express'],
    typescript: ['React', 'Angular', 'Next.js', 'NestJS', 'Deno'],
    python: ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
    java: ['Spring Boot', 'Spring MVC', 'Hibernate', 'Maven', 'Gradle'],
    csharp: ['.NET Core', 'ASP.NET', 'Entity Framework', 'Blazor', 'Xamarin'],
    go: ['Gin', 'Echo', 'Fiber', 'Gorilla Mux', 'Buffalo'],
    rust: ['Actix', 'Rocket', 'Warp', 'Tokio', 'Serde'],
    php: ['Laravel', 'Symfony', 'CodeIgniter', 'Zend', 'CakePHP']
  };

  const templates = [
    {
      title: 'REST API Endpoint',
      description: 'Create a complete REST API with CRUD operations',
      prompt: 'Create a REST API endpoint for user management with GET, POST, PUT, and DELETE operations'
    },
    {
      title: 'Authentication System',
      description: 'User login and registration with JWT tokens',
      prompt: 'Build a complete authentication system with user registration, login, and JWT token management'
    },
    {
      title: 'Database Model',
      description: 'Database schema and model definitions',
      prompt: 'Create database models for an e-commerce application with users, products, and orders'
    },
    {
      title: 'React Component',
      description: 'Reusable React component with props and state',
      prompt: 'Create a reusable React component for a data table with sorting, filtering, and pagination'
    }
  ];

  const handleVoiceCommand = (transcript: string) => {
    setPrompt(transcript);
    handleGenerate();
  };

  const handleVideoAgentMessage = (message: string) => {
    // Process video agent messages for code generation
    if (message.toLowerCase().includes('generate') || message.toLowerCase().includes('create')) {
      setPrompt(message);
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const code = await deepSeekService.generateCode(
        prompt,
        selectedLanguage,
        selectedFramework
      );
      
      setGeneratedCode(code);
      toast.success('Code generated successfully!');
    } catch (error) {
      console.error('Code generation error:', error);
      toast.error('Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const downloadCode = () => {
    const extension = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php'
    }[selectedLanguage] || 'txt';

    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-code.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-400 to-orange-500 rounded-2xl mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Code Generator</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Describe what you want to build and let our AI generate production-ready code in your preferred language and framework.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Language Selection */}
            <div className="bg-card-gradient backdrop-blur-xl rounded-xl p-6 border border-primary-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Programming Language</h3>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedLanguage === lang.id
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-400/50'
                        : 'bg-dark-800/50 text-gray-400 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${lang.color} mx-auto mb-2`}></div>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Selection */}
            <div className="bg-card-gradient backdrop-blur-xl rounded-xl p-6 border border-primary-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Framework/Library</h3>
              <div className="relative">
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white appearance-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                >
                  {frameworks[selectedLanguage]?.map((framework) => (
                    <option key={framework} value={framework.toLowerCase()}>
                      {framework}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Templates */}
            <div className="bg-card-gradient backdrop-blur-xl rounded-xl p-6 border border-primary-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Templates</h3>
              <div className="space-y-3">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(template.prompt)}
                    className="w-full text-left p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <h4 className="text-white font-medium mb-1">{template.title}</h4>
                    <p className="text-gray-400 text-sm">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card-gradient backdrop-blur-xl rounded-xl p-6 border border-primary-500/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-5 w-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Describe Your Code</h3>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build... For example: 'Create a user authentication system with login, registration, and password reset functionality'"
                className="w-full h-32 bg-dark-800/50 border border-primary-500/30 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Be specific for better results</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowVideoAgent(!showVideoAgent)}
                    className={`p-2 rounded ${
                      showVideoAgent ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'
                    } transition-colors`}
                    title="Toggle AI Video Agent"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <VoiceInterface 
                    onTranscript={handleVoiceCommand}
                    context="code"
                    className="mr-2"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center space-x-2 bg-gradient-to-r from-accent-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Generate Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Generated Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card-gradient backdrop-blur-xl rounded-xl border border-primary-500/20 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-primary-500/20">
                <div className="flex items-center space-x-3">
                  <Terminal className="h-5 w-5 text-primary-400" />
                  <h3 className="text-lg font-semibold text-white">Generated Code</h3>
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">
                    {selectedLanguage}
                  </span>
                </div>
                
                {generatedCode && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 px-3 py-2 bg-dark-800/50 text-gray-400 rounded-lg hover:text-white hover:bg-dark-800 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">Copy</span>
                    </button>
                    <button
                      onClick={downloadCode}
                      className="flex items-center space-x-2 px-3 py-2 bg-dark-800/50 text-gray-400 rounded-lg hover:text-white hover:bg-dark-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {generatedCode ? (
                  <pre className="bg-dark-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-gray-300 text-sm leading-relaxed">
                      {generatedCode}
                    </code>
                  </pre>
                ) : (
                  <div className="text-center py-12">
                    <Code2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">Ready to Generate</h4>
                    <p className="text-gray-400 mb-6">
                      Enter a description above, use voice commands, or talk to the AI video agent to generate your code.
                    </p>
                    <button
                      onClick={() => setShowVideoAgent(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      Talk to AI Agent
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tavus Video Agent */}
      {showVideoAgent && (
        <div className="fixed bottom-4 left-4 z-50">
          <TavusVideoAgent
            context="code"
            onMessage={handleVideoAgentMessage}
            minimized={videoAgentMinimized}
            onToggleMinimize={() => setVideoAgentMinimized(!videoAgentMinimized)}
          />
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;
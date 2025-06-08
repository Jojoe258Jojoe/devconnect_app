import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
  MarkerType,
  Position,
  Handle,
  getRectOfNodes,
  getTransformForBounds
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Save, 
  Download, 
  Share2, 
  Undo, 
  Redo,
  Square,
  Circle,
  Diamond,
  Type,
  Trash2,
  Copy,
  Settings,
  Brain,
  FileText,
  Code,
  Image,
  GitBranch,
  Sparkles,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Layers,
  Palette,
  Grid,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  Play,
  Pause,
  Mic,
  Video,
  AlertTriangle,
  History,
  Clock
} from 'lucide-react';
import { useCreateContent } from '../hooks/useDatabase';
import { useAuthStore } from '../store/authStore';
import VoiceInterface from '../components/VoiceInterface';
import TavusVideoAgent from '../components/TavusVideoAgent';
import { deepSeekService } from '../lib/deepseek';
import { DatabaseService } from '../lib/supabase';
import toast from 'react-hot-toast';

// Custom Node Components
const StartEndNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-full bg-gradient-to-r from-green-400 to-green-600 border-2 ${
    selected ? 'border-primary-400' : 'border-green-500'
  } text-white text-center min-w-[100px]`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="font-medium">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const ProcessNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 border-2 ${
    selected ? 'border-primary-400' : 'border-blue-500'
  } text-white text-center min-w-[120px]`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="font-medium">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const DecisionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`relative w-32 h-20 ${selected ? 'ring-2 ring-primary-400' : ''}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="absolute inset-0 transform rotate-45 bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 border-yellow-500 shadow-lg"></div>
    <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm text-center px-2">
      {data.label}
    </div>
    <Handle type="source" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const InputOutputNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`relative px-4 py-2 shadow-lg bg-gradient-to-r from-purple-400 to-purple-600 border-2 ${
    selected ? 'border-primary-400' : 'border-purple-500'
  } text-white text-center min-w-[120px]`}
    style={{ clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' }}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="font-medium">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const TextNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 bg-transparent border-2 border-dashed ${
    selected ? 'border-primary-400' : 'border-gray-400'
  } text-gray-300 text-center min-w-[100px] rounded`}>
    <div className="font-medium">{data.label}</div>
  </div>
);

// Node types configuration
const nodeTypes: NodeTypes = {
  startEnd: StartEndNode,
  process: ProcessNode,
  decision: DecisionNode,
  inputOutput: InputOutputNode,
  text: TextNode,
  input: StartEndNode, // Map default input to our start/end node
  default: ProcessNode, // Map default to our process node
};

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

interface FlowchartData {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    title: string;
    description: string;
    version: number;
    lastModified: string;
    isDraft: boolean;
  };
}

const FlowchartCreator = () => {
  const { user } = useAuthStore();
  const { createFlowchart } = useCreateContent();
  
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // UI state
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showVideoAgent, setShowVideoAgent] = useState(false);
  const [videoAgentMinimized, setVideoAgentMinimized] = useState(false);
  const [showRecentDesigns, setShowRecentDesigns] = useState(false);
  
  // Flowchart metadata
  const [metadata, setMetadata] = useState({
    title: 'Untitled Flowchart',
    description: '',
    version: 1,
    lastModified: new Date().toISOString(),
    isDraft: true
  });
  
  // AI features
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  
  // Recent designs
  const [recentFlowcharts, setRecentFlowcharts] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  
  // History for undo/redo
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check API configuration on mount
  useEffect(() => {
    setApiConfigured(deepSeekService.isFlowchartConfigured());
  }, []);

  // Load recent flowcharts
  useEffect(() => {
    if (user) {
      loadRecentFlowcharts();
    }
  }, [user]);

  const loadRecentFlowcharts = async () => {
    if (!user) return;
    
    setLoadingRecent(true);
    try {
      const flowcharts = await DatabaseService.getFlowcharts(4);
      // Filter to only user's flowcharts
      const userFlowcharts = flowcharts.filter(f => f.user_id === user.id);
      setRecentFlowcharts(userFlowcharts.slice(0, 4));
    } catch (error) {
      console.error('Error loading recent flowcharts:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Tool definitions
  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer, shortcut: 'V' },
    { id: 'startEnd', name: 'Start/End', icon: Circle, shortcut: 'S' },
    { id: 'process', name: 'Process', icon: Square, shortcut: 'P' },
    { id: 'decision', name: 'Decision', icon: Diamond, shortcut: 'D' },
    { id: 'inputOutput', name: 'Input/Output', icon: Layers, shortcut: 'I' },
    { id: 'text', name: 'Text', icon: Type, shortcut: 'T' },
  ];

  // Utility functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        id: generateId(),
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#3B82F6',
        },
        style: {
          strokeWidth: 2,
          stroke: '#3B82F6',
        },
      };
      setEdges((eds) => addEdge(edge, eds));
      addToHistory();
    },
    [addToHistory]
  );

  // Node creation on canvas click
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (selectedTool === 'select') return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 60,
        y: event.clientY - reactFlowBounds.top - 30,
      };

      const newNode: Node = {
        id: generateId(),
        type: selectedTool,
        position,
        data: { 
          label: selectedTool === 'startEnd' ? 'Start' : 
                 selectedTool === 'process' ? 'Process' :
                 selectedTool === 'decision' ? 'Decision?' :
                 selectedTool === 'inputOutput' ? 'Input/Output' :
                 'Text'
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode.id);
      addToHistory();
    },
    [selectedTool, addToHistory]
  );

  // Voice command handler
  const handleVoiceCommand = (transcript: string) => {
    if (!apiConfigured) {
      toast.error('AI features require API configuration.');
      return;
    }
    setUserPrompt(transcript);
    handlePromptSubmit();
  };

  // Video agent message handler
  const handleVideoAgentMessage = (message: string) => {
    if (!apiConfigured) {
      toast.error('AI features require API configuration.');
      return;
    }
    // Process video agent messages for flowchart creation
    if (message.toLowerCase().includes('create') || message.toLowerCase().includes('add')) {
      setUserPrompt(message);
      handlePromptSubmit();
    }
  };

  // AI Generation Function
  const handlePromptSubmit = async () => {
    if (!userPrompt.trim()) return;
    
    if (!apiConfigured) {
      toast.error('AI features require API configuration.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const flowchartData = await deepSeekService.generateFlowchart(userPrompt);
      
      setNodes(flowchartData.nodes);
      setEdges(flowchartData.edges);
      setMetadata(prev => ({
        ...prev,
        title: userPrompt.split(' ').slice(0, 4).join(' ') + ' Flow',
        description: `AI-generated flowchart based on: ${userPrompt}`,
        lastModified: new Date().toISOString()
      }));
      
      addToHistory();
      toast.success('Flowchart generated successfully!');
    } catch (error) {
      console.error('Flowchart generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flowchart. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save flowchart
  const saveFlowchart = async (isDraft = false) => {
    if (!user) {
      toast.error('Please sign in to save flowcharts');
      return;
    }

    try {
      const flowchartData: FlowchartData = {
        nodes,
        edges,
        metadata: {
          ...metadata,
          isDraft,
          lastModified: new Date().toISOString()
        }
      };

      await createFlowchart({
        user_id: user.id,
        title: metadata.title,
        description: metadata.description,
        flowchart_data: flowchartData,
        category: 'general',
        sharing_permission: isDraft ? 'private' : 'public'
      });
      
      setMetadata(prev => ({ ...prev, isDraft }));
      toast.success(`Flowchart saved as ${isDraft ? 'draft' : 'project'}!`);
      
      // Reload recent flowcharts
      loadRecentFlowcharts();
    } catch (error) {
      toast.error('Failed to save flowchart');
      console.error('Save error:', error);
    }
  };

  // Export functions
  const exportFlowchart = () => {
    const dataStr = JSON.stringify({ nodes, edges, metadata }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Flowchart exported as JSON!');
  };

  // Export as PNG function
  const exportAsPNG = useCallback(() => {
    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(nodesBounds, 1024, 768, 0.5, 2);
    
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      toast.error('Failed to create canvas context');
      return;
    }

    canvas.width = 1024;
    canvas.height = 768;
    
    // Fill background
    context.fillStyle = '#0f172a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add a simple representation of the flowchart
    context.fillStyle = '#ffffff';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText('Flowchart Export', canvas.width / 2, 50);
    context.fillText(`Title: ${metadata.title}`, canvas.width / 2, 80);
    context.fillText(`Nodes: ${nodes.length}, Edges: ${edges.length}`, canvas.width / 2, 110);
    
    // Draw simplified nodes
    nodes.forEach((node, index) => {
      const x = 100 + (index % 5) * 180;
      const y = 150 + Math.floor(index / 5) * 100;
      
      context.fillStyle = '#3b82f6';
      context.fillRect(x, y, 120, 60);
      
      context.fillStyle = '#ffffff';
      context.font = '12px Arial';
      context.fillText(node.data.label, x + 60, y + 35);
    });
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${metadata.title.replace(/\s+/g, '_')}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Flowchart exported as PNG!');
      }
    });
  }, [nodes, edges, metadata.title]);

  // Generate code from flowchart
  const generateCodeFromFlowchart = async () => {
    if (!apiConfigured) {
      toast.error('AI features require API configuration.');
      return;
    }

    try {
      const flowchartDescription = `Generate code based on this flowchart:
Title: ${metadata.title}
Description: ${metadata.description}

Nodes:
${nodes.map(node => `- ${node.data.label} (${node.type})`).join('\n')}

Connections:
${edges.map(edge => `- From ${nodes.find(n => n.id === edge.source)?.data.label} to ${nodes.find(n => n.id === edge.target)?.data.label}`).join('\n')}

Please generate appropriate code that implements this flowchart logic.`;

      const code = await deepSeekService.generateCode(
        flowchartDescription,
        'javascript',
        'node.js'
      );
      
      // Create a new blob with the generated code
      const blob = new Blob([code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${metadata.title.replace(/\s+/g, '_')}_generated.js`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Code generated and downloaded!');
    } catch (error) {
      console.error('Code generation error:', error);
      toast.error('Failed to generate code from flowchart');
    }
  };

  const importFlowchart = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setMetadata(data.metadata || metadata);
          addToHistory();
          toast.success('Flowchart imported successfully!');
        } catch (error) {
          toast.error('Invalid flowchart file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Load recent flowchart
  const loadRecentFlowchart = (flowchart: any) => {
    try {
      const data = flowchart.flowchart_data;
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setMetadata(data.metadata || {
        title: flowchart.title,
        description: flowchart.description || '',
        version: 1,
        lastModified: flowchart.updated_at,
        isDraft: flowchart.sharing_permission === 'private'
      });
      addToHistory();
      setShowRecentDesigns(false);
      toast.success('Flowchart loaded successfully!');
    } catch (error) {
      toast.error('Failed to load flowchart');
    }
  };

  // Delete selected nodes
  const deleteSelectedNodes = () => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
    addToHistory();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveFlowchart(false);
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            deleteSelectedNodes();
            break;
          case 'Escape':
            setSelectedTool('select');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      {/* Header */}
      <div className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-6 w-6 text-primary-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Flowchart Creator
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Flowchart title"
              />
              <span className={`px-2 py-1 rounded text-xs ${
                metadata.isDraft 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {metadata.isDraft ? 'Draft' : 'Project'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Recent Designs Button */}
            <button
              onClick={() => setShowRecentDesigns(!showRecentDesigns)}
              className="flex items-center space-x-2 p-2 bg-dark-700 text-gray-400 rounded-lg hover:text-white hover:bg-dark-600 transition-colors"
              title="Recent Designs"
            >
              <History className="h-4 w-4" />
              <span className="text-sm">Recent</span>
            </button>

            {/* Video Agent Toggle */}
            <button
              onClick={() => setShowVideoAgent(!showVideoAgent)}
              className={`p-2 rounded ${
                showVideoAgent ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'
              } transition-colors`}
              title="Toggle AI Video Agent"
            >
              <Video className="h-4 w-4" />
            </button>

            {/* History Controls */}
            <div className="flex items-center space-x-1 bg-dark-700 rounded-lg p-1">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded hover:bg-dark-600 disabled:opacity-50"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded hover:bg-dark-600 disabled:opacity-50"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-1 bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => setIsGridVisible(!isGridVisible)}
                className={`p-2 rounded ${isGridVisible ? 'bg-primary-600' : 'hover:bg-dark-600'}`}
                title="Toggle Grid"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowMiniMap(!showMiniMap)}
                className={`p-2 rounded ${showMiniMap ? 'bg-primary-600' : 'hover:bg-dark-600'}`}
                title="Toggle MiniMap"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowControls(!showControls)}
                className={`p-2 rounded ${showControls ? 'bg-primary-600' : 'hover:bg-dark-600'}`}
                title="Toggle Controls"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            {/* Save Options */}
            <div className="flex items-center space-x-1 bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => saveFlowchart(true)}
                className="p-2 rounded hover:bg-dark-600 text-yellow-400"
                title="Save as Draft"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => saveFlowchart(false)}
                className="p-2 rounded hover:bg-dark-600 text-green-400"
                title="Save as Project"
              >
                <FileText className="h-4 w-4" />
              </button>
              <button
                onClick={exportFlowchart}
                className="p-2 rounded hover:bg-dark-600"
                title="Export as JSON"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded hover:bg-dark-600"
                title="Import"
              >
                <Plus className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importFlowchart}
                className="hidden"
              />
            </div>

            <button className="p-2 rounded hover:bg-dark-600" title="Share">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Tools & AI */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 bg-dark-800/50 border-r border-dark-700 p-4 space-y-4"
            >
              {/* AI Assistant */}
              <div className={`rounded-lg p-4 border ${
                apiConfigured 
                  ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-primary-500/30'
                  : 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30'
              }`}>
                <h3 className={`text-sm font-semibold mb-2 flex items-center ${
                  apiConfigured ? 'text-primary-400' : 'text-red-400'
                }`}>
                  {apiConfigured ? (
                    <Sparkles className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  AI Assistant
                </h3>
                
                {!apiConfigured && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                    <p className="mb-1">Flowchart AI is ready</p>
                    <p className="text-red-400">Using built-in API key for flowchart generation</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Describe your flowchart... e.g., 'Create a user login process'"
                    className="w-full border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 resize-none bg-dark-700 border-dark-600 focus:ring-primary-500"
                    rows={3}
                  />
                  <button
                    onClick={handlePromptSubmit}
                    disabled={!userPrompt.trim() || isGenerating}
                    className="w-full rounded px-3 py-2 text-xs font-medium transition-colors bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>
              </div>

              {/* Tools */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Tools
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          selectedTool === tool.id
                            ? 'bg-primary-600 border-primary-500 text-white'
                            : 'bg-dark-700 border-dark-600 text-gray-300 hover:bg-dark-600'
                        }`}
                        title={`${tool.name} (${tool.shortcut})`}
                      >
                        <IconComponent className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs">{tool.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-dark-700/50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Stats</h3>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Nodes:</span>
                    <span>{nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections:</span>
                    <span>{edges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>{metadata.version}</span>
                  </div>
                </div>
              </div>

              {/* Panel Toggle */}
              <button
                onClick={() => setShowAiPanel(false)}
                className="w-full p-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <EyeOff className="h-4 w-4 mx-auto" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          {!showAiPanel && (
            <button
              onClick={() => setShowAiPanel(true)}
              className="absolute top-4 left-4 z-10 p-2 bg-dark-800/80 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}

          {/* Current Tool Indicator */}
          <div className="absolute top-4 right-4 z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-2 bg-dark-800/80 backdrop-blur-sm rounded-lg p-2"
            >
              {tools.find(t => t.id === selectedTool)?.icon && (() => {
                const IconComponent = tools.find(t => t.id === selectedTool)!.icon;
                return <IconComponent className="h-4 w-4 text-primary-400" />;
              })()}
              <span className="text-primary-400 text-sm capitalize">{selectedTool}</span>
            </motion.div>
          </div>

          {/* Voice Interface */}
          <div className="absolute bottom-4 right-4 z-10">
            <VoiceInterface 
              onTranscript={handleVoiceCommand}
              context="flowchart"
            />
          </div>

          {/* ReactFlow Canvas */}
          <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-dark-900"
              defaultEdgeOptions={{
                type: 'smoothstep',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: '#3B82F6',
                },
                style: {
                  strokeWidth: 2,
                  stroke: '#3B82F6',
                },
              }}
            >
              {showControls && <Controls className="bg-dark-800 border-dark-600" />}
              {showMiniMap && (
                <MiniMap 
                  className="bg-dark-800 border-dark-600"
                  nodeColor="#3B82F6"
                  maskColor="rgba(15, 23, 42, 0.8)"
                />
              )}
              {isGridVisible && (
                <Background 
                  color="#374151" 
                  gap={20} 
                  size={1}
                  variant="dots" as any
                />
              )}
            </ReactFlow>
          </div>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Create Your Flowchart</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Use voice commands, the AI assistant, video agent, or select a tool and click on the canvas to start creating.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pointer-events-auto">
                  <button
                    onClick={() => setSelectedTool('startEnd')}
                    className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  >
                    Start Creating
                  </button>
                  <button
                    onClick={() => setShowVideoAgent(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Talk to AI Agent
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-dark-800/50 border-l border-dark-700 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Properties
            </h3>
            
            <div className="text-gray-500 text-sm text-center py-8">
              Select a node to edit its properties
            </div>
          </div>

          {/* Flowchart Metadata */}
          <div className="bg-dark-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                  placeholder="Describe your flowchart..."
                />
              </div>
              <div className="text-xs text-gray-500">
                <div>Last modified: {new Date(metadata.lastModified).toLocaleString()}</div>
                <div>Version: {metadata.version}</div>
                <div>Status: {metadata.isDraft ? 'Draft' : 'Project'}</div>
              </div>
            </div>
          </div>

          {/* Save Options */}
          <div className="bg-dark-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Save Options</h3>
            <div className="space-y-2">
              <button
                onClick={() => saveFlowchart(true)}
                className="w-full bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg px-3 py-2 text-sm transition-colors text-yellow-400"
              >
                <Save className="h-4 w-4 inline mr-2" />
                Save as Draft
              </button>
              <button
                onClick={() => saveFlowchart(false)}
                className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg px-3 py-2 text-sm transition-colors text-green-400"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Save as Project
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-dark-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Export</h3>
            <div className="space-y-2">
              <button
                onClick={exportFlowchart}
                className="w-full bg-dark-600 hover:bg-dark-500 border border-dark-500 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Export as JSON
              </button>
              <button
                onClick={exportAsPNG}
                className="w-full bg-dark-600 hover:bg-dark-500 border border-dark-500 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                <Image className="h-4 w-4 inline mr-2" />
                Export as PNG
              </button>
              <button
                onClick={generateCodeFromFlowchart}
                disabled={!apiConfigured}
                className="w-full bg-dark-600 hover:bg-dark-500 border border-dark-500 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Code className="h-4 w-4 inline mr-2" />
                Generate Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Designs Modal */}
      <AnimatePresence>
        {showRecentDesigns && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRecentDesigns(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card-gradient backdrop-blur-xl rounded-2xl border border-primary-500/20 p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <History className="h-6 w-6 mr-3 text-primary-400" />
                  Recent Designs
                </h2>
                <button
                  onClick={() => setShowRecentDesigns(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingRecent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-dark-800/30 rounded-lg p-4 animate-pulse">
                      <div className="h-32 bg-dark-700 rounded mb-4"></div>
                      <div className="h-4 bg-dark-700 rounded mb-2"></div>
                      <div className="h-3 bg-dark-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentFlowcharts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentFlowcharts.map((flowchart) => (
                    <motion.div
                      key={flowchart.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-dark-800/30 rounded-lg p-4 cursor-pointer hover:bg-dark-800/50 transition-all"
                      onClick={() => loadRecentFlowchart(flowchart)}
                    >
                      {/* Flowchart Preview */}
                      <div className="h-32 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-lg mb-4 flex items-center justify-center border border-primary-500/20">
                        <div className="text-center">
                          <GitBranch className="h-8 w-8 text-primary-400 mx-auto mb-2" />
                          <div className="text-xs text-gray-400">
                            {flowchart.flowchart_data?.nodes?.length || 0} nodes
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-white font-semibold mb-2 truncate">{flowchart.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {flowchart.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(flowchart.updated_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-1 rounded ${
                          flowchart.sharing_permission === 'private' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {flowchart.sharing_permission === 'private' ? 'Draft' : 'Project'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Recent Designs</h3>
                  <p className="text-gray-400">
                    Create and save flowcharts to see them here.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tavus Video Agent */}
      <AnimatePresence>
        {showVideoAgent && apiConfigured && (
          <div className="fixed bottom-4 left-4 z-50">
            <TavusVideoAgent
              context="flowchart"
              onMessage={handleVideoAgentMessage}
              minimized={videoAgentMinimized}
              onToggleMinimize={() => setVideoAgentMinimized(!videoAgentMinimized)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlowchartCreator;
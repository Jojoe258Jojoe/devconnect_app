// Tavus AI Video Agent Integration
interface TavusConfig {
  apiKey: string;
  baseUrl: string;
}

interface ConversationConfig {
  conversationId?: string;
  replicaId: string;
  personaId?: string;
  properties?: {
    max_call_duration?: number;
    language?: string;
    voice?: string;
  };
}

interface TavusConversation {
  conversationId: string;
  status: 'active' | 'ended' | 'error';
  replicaId: string;
  conversationUrl: string;
}

interface TavusMessage {
  type: 'user' | 'replica';
  content: string;
  timestamp: number;
  metadata?: any;
}

interface TavusReplica {
  replica_id: string;
  replica_name: string;
  status: string;
  created_at: string;
}

class TavusService {
  private config: TavusConfig;
  private activeConversations: Map<string, TavusConversation> = new Map();
  private messageHandlers: Map<string, (message: TavusMessage) => void> = new Map();

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_TAVUS_API_KEY || '',
      baseUrl: 'https://tavusapi.com/v2'
    };
  }

  // Initialize Tavus SDK
  async initialize(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        console.warn('Tavus API key not configured. Please add VITE_TAVUS_API_KEY to your .env file.');
        return false;
      }

      // Test API connection by fetching replicas
      const response = await fetch(`${this.config.baseUrl}/replicas`, {
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Tavus API authentication failed: Invalid or expired API key. Please check your VITE_TAVUS_API_KEY in the .env file.');
        } else {
          console.error('Tavus API connection failed:', response.status, response.statusText);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Tavus:', error);
      return false;
    }
  }

  // Create a new conversation with an AI video agent
  async createConversation(config: ConversationConfig): Promise<TavusConversation | null> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Tavus API key not configured. Please add VITE_TAVUS_API_KEY to your .env file.');
      }

      const response = await fetch(`${this.config.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replica_id: config.replicaId,
          persona_id: config.personaId,
          conversation_name: `DevCollab Session ${Date.now()}`,
          callback_url: `${window.location.origin}/api/tavus/callback`,
          properties: {
            max_call_duration: config.properties?.max_call_duration || 600, // 10 minutes default
            language: config.properties?.language || 'English',
            enable_recording: false,
            voice: config.properties?.voice
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('Tavus API authentication failed: Invalid or expired API key. Please check your VITE_TAVUS_API_KEY in the .env file.');
        }
        throw new Error(`Failed to create conversation: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const conversation: TavusConversation = {
        conversationId: data.conversation_id,
        status: 'active',
        replicaId: config.replicaId,
        conversationUrl: data.conversation_url
      };

      this.activeConversations.set(conversation.conversationId, conversation);
      return conversation;
    } catch (error) {
      console.error('Error creating Tavus conversation:', error);
      return null;
    }
  }

  // Get available AI replicas
  async getReplicas(): Promise<TavusReplica[]> {
    try {
      if (!this.config.apiKey) {
        console.warn('Tavus API key not configured. Please add VITE_TAVUS_API_KEY to your .env file.');
        return [];
      }

      const response = await fetch(`${this.config.baseUrl}/replicas`, {
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Tavus API authentication failed: Invalid or expired API key. Please check your VITE_TAVUS_API_KEY in the .env file.');
        } else {
          console.error('Failed to fetch replicas:', response.status, response.statusText);
        }
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching replicas:', error);
      return [];
    }
  }

  // Send a message to the AI agent
  async sendMessage(conversationId: string, message: string): Promise<boolean> {
    try {
      const conversation = this.activeConversations.get(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // For Tavus, messages are typically sent through the conversation interface
      // This is a placeholder for the actual message sending mechanism
      console.log('Sending message to Tavus conversation:', conversationId, message);
      
      // Simulate message handling
      const userMessage: TavusMessage = {
        type: 'user',
        content: message,
        timestamp: Date.now()
      };

      const handler = this.messageHandlers.get(conversationId);
      if (handler) {
        handler(userMessage);
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // End a conversation
  async endConversation(conversationId: string): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        return false;
      }

      const response = await fetch(`${this.config.baseUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const conversation = this.activeConversations.get(conversationId);
        if (conversation) {
          conversation.status = 'ended';
        }
        this.activeConversations.delete(conversationId);
        this.messageHandlers.delete(conversationId);
      }

      return response.ok;
    } catch (error) {
      console.error('Error ending conversation:', error);
      return false;
    }
  }

  // Get conversation status
  async getConversationStatus(conversationId: string): Promise<string | null> {
    try {
      if (!this.config.apiKey) {
        return null;
      }

      const response = await fetch(`${this.config.baseUrl}/conversations/${conversationId}`, {
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error getting conversation status:', error);
      return null;
    }
  }

  // Register message handler
  onMessage(conversationId: string, handler: (message: TavusMessage) => void): void {
    this.messageHandlers.set(conversationId, handler);
  }

  // Remove message handler
  offMessage(conversationId: string): void {
    this.messageHandlers.delete(conversationId);
  }

  // Get active conversations
  getActiveConversations(): TavusConversation[] {
    return Array.from(this.activeConversations.values());
  }

  // Generate context-aware prompts for different scenarios
  generateContextPrompt(context: 'flowchart' | 'code' | 'collaboration' | 'general', userInput?: string): string {
    const prompts = {
      flowchart: `You are an AI assistant helping with flowchart creation. You're knowledgeable about software architecture, process flows, and visual design. Help users create clear, logical flowcharts for their projects. ${userInput ? `The user said: "${userInput}"` : ''}`,
      
      code: `You are an AI coding assistant. You help developers write clean, efficient code in multiple programming languages. You can explain concepts, debug issues, and suggest best practices. ${userInput ? `The user said: "${userInput}"` : ''}`,
      
      collaboration: `You are an AI collaboration facilitator. You help software engineers connect, share ideas, and work together effectively. You understand project management, team dynamics, and technical collaboration. ${userInput ? `The user said: "${userInput}"` : ''}`,
      
      general: `You are a helpful AI assistant for software engineers. You can help with coding, architecture, collaboration, and general development questions. Be friendly, knowledgeable, and supportive. ${userInput ? `The user said: "${userInput}"` : ''}`
    };

    return prompts[context];
  }

  // Create a specialized agent for different contexts
  async createSpecializedAgent(context: 'flowchart' | 'code' | 'collaboration' | 'general'): Promise<TavusConversation | null> {
    const replicas = await this.getReplicas();
    
    if (replicas.length === 0) {
      console.warn('No Tavus replicas available');
      return null;
    }

    // Filter for active replicas
    const activeReplicas = replicas.filter(replica => replica.status === 'ready' || replica.status === 'active');
    
    if (activeReplicas.length === 0) {
      console.warn('No active Tavus replicas available');
      return null;
    }

    // Use the first available active replica
    const selectedReplica = activeReplicas[0];

    return this.createConversation({
      replicaId: selectedReplica.replica_id,
      properties: {
        max_call_duration: 1800, // 30 minutes
        language: 'English'
      }
    });
  }
}

export const tavusService = new TavusService();
export type { TavusConversation, TavusMessage, ConversationConfig, TavusReplica };
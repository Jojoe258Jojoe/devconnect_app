// DeepSeek AI integration via OpenRouter
interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepSeekService {
  private config: DeepSeekConfig;
  private flowchartApiKey: string;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'deepseek/deepseek-r1-0528:free'
    };
    
    // Specific API key for flowchart generation
    this.flowchartApiKey = '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';
  }

  private validateApiKey(useFlowchartKey = false): void {
    const keyToCheck = useFlowchartKey ? this.flowchartApiKey : this.config.apiKey;
    if (!keyToCheck || keyToCheck.trim() === '') {
      throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
    }
  }

  private extractJson(response: string): string {
    // First, try to extract JSON from markdown code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // If no code block, try to find the outermost JSON object
    const trimmed = response.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.substring(firstBrace, lastBrace + 1);
    }

    // If no JSON structure found, return the original response
    return trimmed;
  }

  async generateResponse(messages: ChatMessage[], useFlowchartKey = false): Promise<string> {
    this.validateApiKey(useFlowchartKey);

    const apiKey = useFlowchartKey ? this.flowchartApiKey : this.config.apiKey;

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'DevCollab - Software Engineer Collaboration Platform',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `DeepSeek API error: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
        } catch {
          errorMessage += ` - ${errorText}`;
        }

        // Provide more specific error messages for common issues
        if (response.status === 401) {
          throw new Error('Invalid or missing API key. Please check your OpenRouter API key configuration.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('API access forbidden. Please check your API key permissions.');
        }
        
        throw new Error(errorMessage);
      }

      const data: ChatCompletionResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from DeepSeek');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  // Generate code based on user prompt and language
  async generateCode(prompt: string, language: string, framework?: string): Promise<string> {
    const systemPrompt = `You are an expert software engineer and code generator. Generate clean, production-ready code based on the user's requirements.

Requirements:
- Programming Language: ${language}
${framework ? `- Framework/Library: ${framework}` : ''}
- Write complete, functional code
- Include proper error handling
- Add helpful comments
- Follow best practices and conventions
- Make the code production-ready

Respond with ONLY the code, no explanations or markdown formatting.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    return this.generateResponse(messages, false);
  }

  // Generate flowchart data based on user description - USES SPECIFIC API KEY
  async generateFlowchart(description: string): Promise<{ nodes: any[], edges: any[] }> {
    const systemPrompt = `You are an expert at creating flowcharts and process diagrams. Based on the user's description, generate a flowchart structure.

Return a JSON object with "nodes" and "edges" arrays that represent a flowchart. Use this format:

{
  "nodes": [
    {
      "id": "unique_id",
      "type": "startEnd" | "process" | "decision" | "inputOutput",
      "position": { "x": number, "y": number },
      "data": { "label": "Node text" }
    }
  ],
  "edges": [
    {
      "id": "unique_id",
      "source": "source_node_id",
      "target": "target_node_id",
      "type": "smoothstep",
      "markerEnd": { "type": "ArrowClosed" },
      "label": "optional_label"
    }
  ]
}

Node types:
- startEnd: For start/end points (circular)
- process: For process steps (rectangular)
- decision: For decision points (diamond)
- inputOutput: For input/output operations (parallelogram)

Position nodes logically with proper spacing (100-200px apart).
Respond with ONLY the JSON, no explanations.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: description }
    ];

    const response = await this.generateResponse(messages, true); // Use flowchart API key
    
    try {
      const cleanJson = this.extractJson(response);
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Failed to parse flowchart JSON:', error);
      console.error('Raw response:', response);
      throw new Error('Invalid flowchart data generated');
    }
  }

  // Generate conversational responses for voice/video interactions
  async generateConversationalResponse(userInput: string, context: 'flowchart' | 'code' | 'collaboration' | 'general'): Promise<string> {
    const contextPrompts = {
      flowchart: 'You are an AI assistant helping with flowchart creation. You understand software architecture, process flows, and visual design. Provide helpful, concise responses about flowchart creation and process visualization.',
      
      code: 'You are an AI coding assistant. You help developers write clean, efficient code in multiple programming languages. Provide helpful guidance about coding, debugging, and best practices.',
      
      collaboration: 'You are an AI collaboration facilitator. You help software engineers connect, share ideas, and work together effectively. Provide guidance on teamwork, project management, and technical collaboration.',
      
      general: 'You are a helpful AI assistant for software engineers. You can help with coding, architecture, collaboration, and general development questions. Be friendly, knowledgeable, and supportive.'
    };

    const systemPrompt = `${contextPrompts[context]}

Keep responses:
- Conversational and friendly
- Concise but helpful (1-3 sentences)
- Focused on the user's immediate need
- Encouraging and supportive

If the user is asking you to create or generate something, acknowledge their request and provide brief guidance.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ];

    // Use flowchart API key for flowchart context, regular key for others
    return this.generateResponse(messages, context === 'flowchart');
  }

  // Generate article content
  async generateArticle(title: string, topic: string, targetLength: 'short' | 'medium' | 'long' = 'medium'): Promise<{ content: string; excerpt: string; tags: string[] }> {
    const lengthGuide = {
      short: '500-800 words',
      medium: '1000-1500 words',
      long: '2000-3000 words'
    };

    const systemPrompt = `You are an expert technical writer specializing in software engineering topics. Write a comprehensive, well-structured article.

Requirements:
- Title: ${title}
- Topic: ${topic}
- Length: ${lengthGuide[targetLength]}
- Include practical examples and code snippets where relevant
- Use clear headings and subheadings
- Write in a professional but accessible tone
- Include actionable insights

Return a JSON object with:
{
  "content": "Full article content in markdown format",
  "excerpt": "2-3 sentence summary",
  "tags": ["relevant", "tags", "array"]
}

Respond with ONLY the JSON, no explanations.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Write an article about: ${topic}` }
    ];

    const response = await this.generateResponse(messages, false);
    
    try {
      const cleanJson = this.extractJson(response);
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Failed to parse article JSON:', error);
      console.error('Raw response:', response);
      throw new Error('Invalid article data generated');
    }
  }

  // Generate project ideas
  async generateProjectIdea(category: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<{ title: string; description: string; detailedDescription: string; requiredSkills: string[]; estimatedDuration: string }> {
    const systemPrompt = `You are an expert at generating innovative software project ideas. Create a compelling project idea based on the given parameters.

Requirements:
- Category: ${category}
- Difficulty: ${difficulty}
- Make it practical and achievable
- Include modern technologies
- Consider real-world applications

Return a JSON object with:
{
  "title": "Compelling project title",
  "description": "Brief 1-2 sentence description",
  "detailedDescription": "Detailed explanation of the project, features, and goals (3-4 paragraphs)",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "estimatedDuration": "time estimate (e.g., '2-3 months', '4-6 weeks')"
}

Respond with ONLY the JSON, no explanations.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a ${difficulty} level project idea for ${category}` }
    ];

    const response = await this.generateResponse(messages, false);
    
    try {
      const cleanJson = this.extractJson(response);
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Failed to parse project idea JSON:', error);
      console.error('Raw response:', response);
      throw new Error('Invalid project idea data generated');
    }
  }

  // Check if API is configured
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.apiKey.trim() !== '');
  }

  // Check if flowchart API is configured (always true since we have the hardcoded key)
  isFlowchartConfigured(): boolean {
    return !!(this.flowchartApiKey && this.flowchartApiKey.trim() !== '');
  }
}

export const deepSeekService = new DeepSeekService();
export type { ChatMessage };
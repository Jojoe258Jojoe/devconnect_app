// ElevenLabs API integration for text-to-speech and speech-to-text
import { deepSeekService } from './deepseek';

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }

  // Text-to-Speech
  async textToSpeech(text: string, voiceId = 'pNInz6obpgDQGcFmaJgB'): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS error: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  // Play audio from ArrayBuffer
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    const audioContext = new AudioContext();
    const audioBufferDecoded = await audioContext.decodeAudioData(audioBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBufferDecoded;
    source.connect(audioContext.destination);
    source.start();

    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  }

  // Speech-to-Text using Web Speech API (fallback for ElevenLabs)
  startSpeechRecognition(
    onResult: (transcript: string) => void,
    onError: (error: string) => void
  ): SpeechRecognition | null {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError(event.error);
    };

    recognition.start();
    return recognition;
  }

  // Generate conversational responses using DeepSeek AI
  async generateResponse(userInput: string, context: 'flowchart' | 'code' | 'general' = 'general'): Promise<string> {
    try {
      return await deepSeekService.generateConversationalResponse(userInput, context);
    } catch (error) {
      console.error('DeepSeek response generation error:', error);
      
      // Fallback responses if DeepSeek fails
      const fallbackResponses = {
        flowchart: {
          greeting: "I'll help you create a flowchart. What process would you like to visualize?",
          processing: "Great! I'm generating your flowchart now. This shows the flow of your process step by step.",
          completion: "Your flowchart is ready! You can see the visual representation of your process. Would you like me to explain any part of it?",
          error: "I had trouble understanding that. Could you describe your process in simple steps? For example, 'User logs in, then validates credentials, then either grants or denies access'."
        },
        code: {
          greeting: "I'm ready to generate code for you. What would you like me to build?",
          processing: "I'm writing your code now. I'll create clean, production-ready code based on your requirements.",
          completion: "Your code is generated! I've created a well-structured solution. Would you like me to explain how it works?",
          error: "I need more details about what you want to build. Could you be more specific about the functionality you need?"
        },
        general: {
          greeting: "Hello! I'm your AI assistant. I can help you create flowcharts, generate code, or answer questions about development.",
          processing: "I'm working on that for you...",
          completion: "Done! Is there anything else I can help you with?",
          error: "I didn't quite understand that. Could you rephrase your request?"
        }
      };

      // Simple intent detection for fallback
      if (userInput.toLowerCase().includes('flowchart') || userInput.toLowerCase().includes('process') || userInput.toLowerCase().includes('flow')) {
        return fallbackResponses.flowchart.greeting;
      } else if (userInput.toLowerCase().includes('code') || userInput.toLowerCase().includes('function') || userInput.toLowerCase().includes('program')) {
        return fallbackResponses.code.greeting;
      } else if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
        return fallbackResponses.general.greeting;
      } else {
        return fallbackResponses[context].processing;
      }
    }
  }
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const elevenLabsService = new ElevenLabsService();
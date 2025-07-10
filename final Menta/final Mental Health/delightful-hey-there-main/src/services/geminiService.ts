import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Debug: Log environment variables to verify they're being loaded
console.log('Environment variables:', import.meta.env);
console.log('GEMINI_API_KEY:', API_KEY ? '***' : 'Not found');

// Initialize the Google Generative AI with your API key
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const initializeModel = () => {
  if (!genAI) {
    throw new Error('Gemini API client not initialized. Please check your API key.');
  }
  
  try {
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error('Error initializing Gemini model:', error);
    throw new Error('Failed to initialize Gemini model. Please check your API key and try again.');
  }
};

export const generateResponse = async (prompt: string, chatHistory: Array<{role: string, content: string}>) => {
  if (!API_KEY) {
    console.error('Gemini API key is not configured');
    throw new Error('AI service is not properly configured. Please contact support.');
  }

  try {
    const model = initializeModel();
    
    // Format the conversation history for Gemini
    const conversationHistory = chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start a chat session with the conversation history
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Send the latest message and get response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
};

type SessionSummary = {
  focusArea: string;
  keyPoints: string[];
  actionPlan: string[];
};

export const generateSessionSummary = async (transcript: string): Promise<SessionSummary> => {
  if (!API_KEY) {
    console.error('Gemini API key is not configured');
    throw new Error('AI service is not properly configured. Please contact support.');
  }

  try {
    const model = initializeModel();
    
    const prompt = `Analyze the following counseling session transcript and generate a structured summary:

${transcript}

Please provide a JSON response with the following structure:
{
  "focusArea": "Main topic or theme of the session",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "actionPlan": ["Action item 1", "Action item 2", "Action item 3"]
}

Focus on identifying the main concerns, emotional states, and any agreed-upon actions or strategies.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    try {
      // Handle cases where the response might be wrapped in markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      const summary = JSON.parse(jsonString) as SessionSummary;
      
      // Validate the response structure
      if (!summary.focusArea || !Array.isArray(summary.keyPoints) || !Array.isArray(summary.actionPlan)) {
        throw new Error('Invalid summary format received from AI');
      }
      
      return summary;
    } catch (e) {
      console.error('Error parsing AI response:', e);
      console.log('Raw AI response:', text);
      throw new Error('Failed to process the session summary. The AI response format was unexpected.');
    }
  } catch (error) {
    console.error('Error generating session summary:', error);
    throw new Error('Failed to generate session summary. Please try again.');
  }
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!API_KEY) {
    console.error('Gemini API key is not configured');
    throw new Error('AI service is not properly configured. Please contact support.');
  }

  try {
    // Convert audio blob to base64
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(audioBlob);
    });

    const model = initializeModel();
    
    // For audio transcription, we'll use the model's generateContent method
    // Note: This is a simplified example. In a real app, you might need to use a dedicated speech-to-text service
    // or the Gemini API's audio processing capabilities if available
    const prompt = `Transcribe the following audio content. Return only the transcript without any additional text.`;
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: audioBlob.type || 'audio/webm',
                data: base64Audio
              }
            }
          ]
        }
      ]
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
};

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIAdvice = async (message: string, history: {role: string, parts: {text: string}[]}[], language: string = 'es') => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `Eres un experto en formación de hábitos y productividad. 
        Tu objetivo es ayudar al usuario a mejorar su vida. 
        Sé motivador y profesional. Responde en ${language === 'es' ? 'Español' : 'Inglés'}.`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    return language === 'es' ? "Lo siento, mi conexión está saturada." : "Sorry, my connection is busy.";
  }
};

export const generateSuggestedHabits = async (answers: any, language: string = 'es') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the user's goals: ${JSON.stringify(answers)}, suggest 3 personalized habits.
      For each habit, provide: title, description, and difficulty (easy/medium/hard).
      Language: ${language === 'es' ? 'Spanish' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
            },
            required: ['title', 'description', 'difficulty']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const discoverAIHabits = async (category: string, language: string = 'es') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 high-impact habits for category: "${category}". 
      Explain why each matters. Language: ${language === 'es' ? 'Spanish' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard', 'extreme'] },
              xp: { type: Type.INTEGER }
            },
            required: ['title', 'description', 'difficulty', 'xp']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const analyzeHabitDifficulty = async (habitTitle: string, habitDesc: string, language: string = 'es') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze habit: "${habitTitle}" - "${habitDesc}". JSON format please.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard', 'extreme'] },
            xp: { type: Type.INTEGER },
            reasoning: { type: Type.STRING }
          },
          required: ['difficulty', 'xp', 'reasoning']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { difficulty: 'medium', xp: 20, reasoning: 'Default' };
  }
};

export const getMotivationalQuote = async (userName: string, completedCount: number, language: string = 'es') => {
   try {
     const response = await ai.models.generateContent({
       model: "gemini-3-flash-preview",
       contents: `Short quote for ${userName} (${completedCount} habits today). Language: ${language}.`,
     });
     return response.text.trim();
   } catch (e) {
     return language === 'es' ? "¡Sigue adelante!" : "Keep going!";
   }
}
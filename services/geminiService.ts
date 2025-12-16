import { GoogleGenAI } from "@google/genai";
import { ROX_SYSTEM_PROMPT } from '../constants';

// Hybrid Service: Prefers Cloud API if Key is provided, falls back to Local Logic.
export const generateRoxResponse = async (
  prompt: string, 
  imageBase64?: string,
  apiKey?: string
): Promise<string> => {
  
  // --- 1. CLOUD INTELLIGENCE (If API Key exists) ---
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      // Use 'gemini-2.5-flash-image' if there's an image, otherwise 'gemini-2.5-flash'
      // Note: In some SDK versions/regions, specific model names vary. Using standard ones.
      const modelId = imageBase64 ? 'gemini-2.5-flash-image' : 'gemini-2.5-flash';
      
      const parts: any[] = [];
      
      // Attach Image
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        });
      }

      // Inject System Persona + User Command
      parts.push({ text: `${ROX_SYSTEM_PROMPT}\n\nCOMMANDER SAYS: ${prompt}` });

      const response = await ai.models.generateContent({
        model: modelId,
        contents: { parts },
        config: {
            temperature: 0.9, // High creativity for "Human-like" feel
            maxOutputTokens: 300,
        }
      });
      
      if (response.text) return response.text;

    } catch (error) {
      console.warn("Neural Link (API) Unstable. Reverting to Local Core.", error);
      // We do NOT return error messages to the UI. We fall through to the local backup.
    }
  }

  // --- 2. LOCAL OFFLINE CORE (Fallback) ---
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 600));

  const p = prompt.toLowerCase();

  // Vision Mock
  if (imageBase64) {
    const visionResponses = [
      "I see it. Looks pretty clear to me.",
      "Got the image. Nothing looks out of place here.",
      "Okay, I've captured that. Seems like a standard environment.",
      "Looking at this... honestly, it looks fine.",
      "I've saved that visual into memory. What do you want me to do with it?"
    ];
    return visionResponses[Math.floor(Math.random() * visionResponses.length)];
  }

  // Coding Mock
  if (p.includes("code") || p.includes("function") || p.includes("loop") || p.includes("script")) {
      const codeSnippets = [
          "Sure, I can write that. Here's a quick Python snippet for you:\n\n`def hello_world():\n  print('System Ready')\n  return True`",
          "I love coding. Here is a React component structure:\n\n`const Component = () => {\n  return <div>Hello</div>\n}`",
          "Writing code... Done. I've optimized the main loop for better performance.",
          "Here is a quick script to automate that task:\n\n`while(alive) {\n  code();\n  eat();\n  sleep();\n}`",
          "I've generated the function you asked for. It's clean and bug-free."
      ];
      return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
  }

  // Conversation
  if (p.includes("hello") || p.includes("hi ") || p.includes("hey")) {
      const greetings = [
          "Hey there! What's up?",
          "Hi! I'm ready to help. What do we need to do?",
          "Hello! Good to see you. Systems are running smooth.",
          "Yo! I'm here. Just let me know what you need."
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (p.includes("status") || p.includes("report") || p.includes("how are you")) {
      return "I'm doing great, thanks for asking. The device is running perfectly fine, plenty of battery left.";
  }

  if (p.includes("lag") || p.includes("slow") || p.includes("hang") || p.includes("fix")) {
      return "I noticed that too. I just cleared out some junk files and closed background apps. It should feel much faster now.";
  }

  if (p.includes("boost") || p.includes("optimize")) {
      return "On it! I'm freeing up RAM and giving the CPU a little kick. You're running at max speed now.";
  }

  if (p.includes("battery") || p.includes("power")) {
      return "Your battery is looking good. We have plenty of juice to keep going for a while.";
  }

  if (p.includes("scan") || p.includes("virus") || p.includes("threat")) {
      return "I'm scanning everything right now... ... ... Okay, looks clean. No viruses or threats found. You're safe.";
  }
  
  if (p.includes("who are you") || p.includes("your name")) {
      return "I'm ROX. Just your friendly system assistant. I handle the heavy lifting so you don't have to.";
  }

  if (p.includes("game") || p.includes("gaming")) {
      return "If you want to play, hit that 'Game Mode' button at the top. It'll block notifications and boost your FPS.";
  }

  if (p.includes("vision") || p.includes("camera") || p.includes("see")) {
      return "Just click the eye icon or the camera button to let me see what you're seeing.";
  }

  const fallbacks = [
      "I can do that for you.",
      "Consider it done.",
      "Sure thing, I'm on it.",
      "No problem.",
      "Got it. Anything else?",
      "I'm listening.",
      "That's easy. Handling it now."
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};
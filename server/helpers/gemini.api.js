const { GoogleGenAI, Type } = require("@google/genai");

const GOOGLE_GENAI_API_KEY = "AIzaSyBI2iDT_3rt0OhV_e4_hPdbw7oxDyKJhhE";

const ai = new GoogleGenAI({ apiKey: GOOGLE_GENAI_API_KEY });

async function generateContent(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.INTEGER,
          },
        },
      },
    });
    return response.text;
  } catch (error) {
    console.log(error);
    if (error.response && error.response.status === 503) {
      throw new Error("Service Unavailable: Please try again later.");
    }
    throw error;
  }
}
module.exports = {
  generateContent,
};

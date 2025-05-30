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
          // type: Type.OBJECT,
          // properties: {
          //   title: { type: Type.STRING },
          //   synopsis: { type: Type.STRING },
          //   genreId: { type: Type.INTEGER },
          //   rating: { type: Type.INTEGER },
          //   trailerUrl: { type: Type.STRING },
          //   imgUrl: { type: Type.STRING },
          // },
          type: Type.ARRAY,
          items: {
            type: Type.INTEGER,
          },
        },
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    // 503 Service Unavailable
    if (error.response && error.response.status === 503) {
      throw new Error("Service Unavailable: Please try again later.");
    }
    throw error;
  }
}
module.exports = {
  generateContent,
};

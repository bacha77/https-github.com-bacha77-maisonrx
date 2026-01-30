
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client using the environment variable as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseBulkOrders = async (csvContent: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse the following CSV data into a JSON array of medical orders. 
      CSV CONTENT:
      ${csvContent}
      
      Requirements:
      - Clean patient names
      - Standardize medication names
      - Extract delivery priorities
      - Identify if any medication requires refrigeration based on general pharmaceutical knowledge (e.g., Insulin).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              patientName: { type: Type.STRING },
              patientPhone: { type: Type.STRING },
              address: { type: Type.STRING },
              medications: { type: Type.ARRAY, items: { type: Type.STRING } },
              requiresRefrigeration: { type: Type.BOOLEAN },
              isHighValue: { type: Type.BOOLEAN },
              deliveryWindow: { type: Type.STRING }
            },
            required: ["patientName", "address", "medications"]
          }
        }
      }
    });
    // Access response.text as a property, not a method. Handle potential undefined.
    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const getAuditSummary = async (logs: any[]) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize the following security audit logs for a HIPAA compliance report. Highlight any suspicious activity or unauthorized access attempts.
            LOGS: ${JSON.stringify(logs)}`
        });
        // Directly return the text property from the response.
        return response.text || "No summary available for these logs.";
    } catch (error) {
        console.error("Gemini Summary Error:", error);
        return "Failed to generate AI audit summary.";
    }
}

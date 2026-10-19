const { GoogleGenerativeAI } = require("@google/generative-ai");
module.exports = (systemInstruction) => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.5-flash", systemInstruction });
};

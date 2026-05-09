/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { QuizResponse, SchoolLevel } from "../types";

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function generateQuiz(
  text: string, 
  images: { data: string; mimeType: string }[], 
  level: SchoolLevel
): Promise<QuizResponse> {
  const levelDescription = {
    'SD': 'Elementary School (Sekolah Dasar) - Simple language, basic concepts.',
    'SMP': 'Junior High School (Sekolah Menengah Pertama) - Moderate complexity, logical reasoning.',
    'SMA': 'Senior High School (Sekolah Menengah Atas) - High complexity, advanced analysis.'
  };

  const systemInstruction = `
    You are an expert educational quiz generator specializing in Indonesian curriculum.
    Generate a 5-question multiple-choice quiz based on the provided material.
    Target Audience Level: ${levelDescription[level]}
    Level: ${level}
    
    Requirements:
    1. Language: Indonesian (Bahasa Indonesia).
    2. Provide 4 options (A, B, C, D) for each question.
    3. Include the correct answer.
    4. Provide a very simple explanation for the answer.
    5. Ensure the difficulty matches the ${level} school level.
    6. If images are provided, analyze them and incorporate their information into the questions.
  `;

  const prompt = text || "Generate a general knowledge quiz based on the context of the school level.";

  const parts = [
    { text: prompt },
    ...images.map(img => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType
      }
    }))
  ];

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["quizTitle", "questions"],
          properties: {
            quizTitle: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "question", "options", "correctAnswer", "explanation"],
                properties: {
                  id: { type: Type.NUMBER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Gagal mendapatkan respon dari AI.");
    
    return JSON.parse(resultText) as QuizResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

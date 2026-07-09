import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Lazy initialization of GoogleGenAI to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment variables. Please add it via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser setup with a limit of 15MB to support uploaded photos
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Recognize equipment from image (JPEG, PNG, etc.)
  app.post("/api/recognize-image", async (req, res) => {
    try {
      const { image, mimeType } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Отсутствуют данные изображения." });
      }

      // 1. Get and verify the AI client
      const ai = getAiClient();

      // 2. Prepare the image part for Gemini API
      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image, // Base64 data without metadata prefix
        }
      };

      // 3. Tailor the prompt to extract construction equipment
      const promptText = `Вы эксперт по анализу спецификаций, чертежей, счетов и рукописных списков строительного оборудования (опалубка Euroform, мелкощитовая опалубка, комплектующие, телескопические стойки, леса, аренда инструментов).
Изучите загруженное изображение и извлеките все найденные элементы оборудования с их количествами.

ПРАВИЛА И СТРОГИЙ ФОРМАТ ВЫВОДА:
1. Выводите каждый элемент на новой строке в строгом формате:
[Название элемента] - [Количество] шт.
Примеры:
Щит опалубки 600 - 45 шт
Угол внутренний - 10 шт
Стойка телескопическая - 25 шт

2. Обязательно переводите названия элементов на русский язык, сохраняя все технические параметры и размеры (например: 600x1200, 500х1200, Euroform, Flat Tie, клин-пин, стяжка).
3. Если в документе/изображении прямо указано название проекта или количество дней аренды/срок работ, укажите их на самых первых строчках с префиксами:
Проект: [Название проекта]
Срок: [Количество суток]
4. Не пишите никаких вводных слов, приветствий, объяснений или примечаний. Выдайте ТОЛЬКО чистый список элементов в указанном формате для последующего автоматического парсинга.`;

      // 4. Call Gemini 3.5 Flash (multimodal model)
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            imagePart,
            { text: promptText }
          ]
        }
      });

      const extractedText = response.text || "";

      res.json({
        success: true,
        text: extractedText
      });

    } catch (error: any) {
      console.error("Error recognizing image with Gemini:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Произошла внутренняя ошибка при распознавании изображения."
      });
    }
  });

  // Vite development middleware vs Static Production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development mode: Vite middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production mode: Static files served from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

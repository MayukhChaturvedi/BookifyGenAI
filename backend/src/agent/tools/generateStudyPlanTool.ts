import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import sql from '../../db/db.js';
import { pipeline } from '@xenova/transformers';
import { ChatGroq } from '@langchain/groq';

// ------------------
// Lazy-load models
// ------------------
let embedderPromise: Promise<any> | undefined;
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedderPromise;
}

let topicExtractorPromise: ChatGroq | undefined;
function getTopicExtractor() {
  if (!topicExtractorPromise) {
    topicExtractorPromise = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY!,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });
  }
  return topicExtractorPromise;
}

// ------------------
// Tool definition
// ------------------
type BookSearchResult = {
  id: number;
  title: string;
  author: string;
  genre: string;
  similarity: number;
};

const generateStudyPlanTool = tool(
  async ({ syllabusText, filePath }): Promise<string> => {
    try {
      // 1️⃣ Read syllabus text from file or direct text input
      let text = '';
      if (filePath && fs.existsSync(filePath)) {
        try {
          const buffer = await fs.promises.readFile(filePath);
          const parser = new PDFParse({ data: buffer }); // Pass buffer via { data: ... }
          const pdfData = await parser.getText(); // Async method for text extraction
          await parser.destroy(); // Good practice: Free memory after use
          text = pdfData.text;
        } catch (readError) {
          console.error(`PDF read failed for ${filePath}:`, readError);
          throw new Error(`Invalid PDF at ${filePath}`);
        }
      } else if (syllabusText) {
        text = syllabusText;
      } else {
        return JSON.stringify({
          message: 'No syllabus text or file provided.',
        });
      }

      // 2️⃣ Extract topics using LLM
      const topicExtractor = getTopicExtractor();
      const prompt = `
        Extract the key academic topics and subjects from this syllabus text.
        Return them as a comma-separated list only — no commentary:
        ${text.slice(0, 5000)}
      `;

      const topicResponse = await topicExtractor.invoke(prompt);
      const topics = topicResponse.text
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (!topics.length) {
        return JSON.stringify({
          message: 'No topics detected in the syllabus.',
          topics: [],
        });
      }

      // 3️⃣ Generate embeddings for each topic
      const embedder = await getEmbedder();
      const studyPlan: Record<string, BookSearchResult[]> = {};

      for (const topic of topics) {
        const embeddingTensor = await embedder(topic, {
          pooling: 'mean',
          normalize: true,
        });
        const embeddingVector = Array.from(embeddingTensor.data);
        const embeddingString = `[${embeddingVector.join(',')}]`;

        // 4️⃣ Query top 3 similar books using pgvector <#> operator
        const results = await sql<BookSearchResult[]>`
          SELECT
            book_id as id,
            title,
            author,
            genre,
            1 - (embedding <#> ${embeddingString}) AS similarity
          FROM book_embeddings
          ORDER BY (embedding <#> ${embeddingString}) ASC
          LIMIT 3;
        `;

        studyPlan[topic] = results.map((r) => ({
          ...r,
          similarity: Number(r.similarity),
        }));
      }

      // 5️⃣ Return structured JSON result
      return JSON.stringify(
        {
          summary: `Generated study plan for ${topics.length} topics.`,
          topics: studyPlan,
        },
        null,
        2,
      );
    } catch (error) {
      console.error('Error in generateStudyPlanTool:', error);
      return JSON.stringify({
        message: 'An error occurred while generating the study plan.',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  {
    name: 'generateStudyPlan',
    description: `
      Generates a structured study plan based on a syllabus (either text or uploaded PDF).
      It extracts key topics and maps them to relevant library books using semantic similarity search.
    `,
    schema: z.object({
      syllabusText: z
        .string()
        .optional()
        .describe('The text content of the syllabus.'),
      filePath: z
        .string()
        .optional()
        .describe('Path to the uploaded syllabus file (PDF format).'),
    }),
  },
);

export default generateStudyPlanTool;

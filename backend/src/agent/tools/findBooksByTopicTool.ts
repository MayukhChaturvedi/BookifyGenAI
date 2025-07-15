import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import sql from '../../db/db.js';
import { cat, pipeline } from '@xenova/transformers';

// Load the embedding pipeline once at startup
let embedderPromise: Promise<any> | undefined;
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedderPromise;
}

type BookSearchResult = {
  id: number;
  title: string;
  author: string;
  genre: string;
  similarity: number;
};

const findBooksByTopicTool = tool(
  async ({ topic }): Promise<string> => {
    try {
      const embedder = await getEmbedder();

      // Generate embedding for the query
      const embeddingTensor = await embedder(topic, {
        pooling: 'mean',
        normalize: true,
      });
      const embeddingVector = Array.from(embeddingTensor.data);

      // Convert to Postgres-compatible array string: '[1,2,3,...]'
      const embeddingString = `[${embeddingVector.join(',')}]`;

      // Query top 5 most similar books
      const results = await sql<BookSearchResult[]>`
            SELECT
                book_id as id,
                title,
                author,
                genre,
                1 - (embedding <#> ${embeddingString}) AS similarity
            FROM book_embeddings
            ORDER BY (embedding <#> ${embeddingString}) ASC
            LIMIT 5
            `;

      return JSON.stringify(results, null, 2);
    } catch (error) {
      console.error('Error in findBooksByTopicTool:', error);
      return 'An error occurred while searching for books. Please try again later.';
    }
  },
  {
    name: 'findBooksByTopic',
    description:
      "Searches for books based on a general topic, concept, or description. Use this for broad, semantic queries like 'books about space exploration' or 'what are some funny fantasy novels?'. This is for recommendations, not for finding specific books by title or author.",
    schema: z.object({
      // The parameter name is now 'topic' for clarity
      topic: z
        .string()
        .min(3, 'Topic must be at least 3 characters long')
        .describe("The user's topic or concept query."),
    }),
  },
);

export default findBooksByTopicTool;

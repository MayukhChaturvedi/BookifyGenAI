import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AIMessage } from '@langchain/core/messages';
import sql from '../../db/db.js';

const summarizationModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: 'llama3-8b-8192', // A smaller, faster model is great for summarization
  temperature: 0.2,
});

/**
 * Takes an existing summary and new messages, and creates a new, updated summary.
 * @param existingSummary The summary from the last summarization run.
 * @param newMessages The new messages since the last summary.
 * @returns The new, updated summary.
 */
export const createNewSummary = async (
  existingSummary: string,
  newMessages: { type: string; content: string }[],
): Promise<string> => {
  const formattedNewMessages = newMessages
    .map((msg) => `${msg.type}: ${msg.content}`)
    .join('\n');

  const prompt = new SystemMessage(`
You are a conversation summarization agent. Your task is to take an existing summary and a new block of conversation and create a new, concise, and updated summary.
The summary should be in the third person and capture the key information and user intent.

Existing Summary:
---
${existingSummary || 'None.'}
---

New Conversation Block:
---
${formattedNewMessages}
---

Please provide the new, updated summary based on the information above.
`);

  const result = await summarizationModel.invoke([prompt]);
  return result.content as string;
};

/**
 * Saves the new summary to the database.
 * @param sessionId The ID of the conversation session.
 * @param summary The new summary text.
 */
export const saveSummary = async (
  sessionId: string,
  summary: string,
): Promise<void> => {
  await sql`
        INSERT INTO chat_summaries (session_id, summary, updated_at)
        VALUES (${sessionId}, ${summary}, NOW())
        ON CONFLICT (session_id)
        DO UPDATE SET
            summary = EXCLUDED.summary,
            updated_at = NOW();
    `;
  console.log(`🔹 Summary updated for session: ${sessionId}`);
};

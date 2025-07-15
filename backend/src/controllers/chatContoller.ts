import { Request, Response } from 'express';
import { HumanMessage, isAIMessage } from '@langchain/core/messages';
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { app } from '../agent/chatbotAgent.js'; // Import the compiled graph
import asyncHandler from 'express-async-handler';
import {
  createNewSummary,
  saveSummary,
} from '../agent/util/summarizationService.js';
import sql from '../db/db.js';
import pool from '../db/chatPool.js';

const SUMMARIZATION_THRESHOLD = 10; // Trigger summarization every 10 messages

export const chatWithAgent = asyncHandler(
  async (req: Request, res: Response) => {
    const { query } = req.body;
    const sessionId = req.user?.session as string;
    const userId = req.user?.id as string;

    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }
    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    // 1. Initialize Postgres-backed chat history
    const chatHistory = new PostgresChatMessageHistory({
      sessionId,
      pool,
      tableName: 'chat_history',
    });

    // 2. Load existing summary and recent messages
    const summaryResult =
      await sql`SELECT summary FROM chat_summaries WHERE session_id = ${sessionId}`;
    const existingSummary = summaryResult[0]?.summary || '';
    const recentMessages = await chatHistory.getMessages();

    const messagesForGraph = [...recentMessages, new HumanMessage(query)];

    // 3. Run the agent graph
    const graphInput = {
      messages: messagesForGraph,
      summary: existingSummary,
    };

    const config = {
      configurable: {
        sessionId: sessionId,
        userId: userId,
      },
    };

    const graphResponse = await app.invoke(graphInput, config);

    const aiResponse = graphResponse.messages.slice(-1)[0];

    // 4. Save the new messages to history
    await chatHistory.addMessages([new HumanMessage(query), aiResponse]);

    // 5. Conditional Summarization Logic
    const allMessages = await chatHistory.getMessages();
    if (allMessages.length >= SUMMARIZATION_THRESHOLD) {
      console.log(
        `🔹 Threshold reached. Summarizing for session: ${sessionId}`,
      );

      // This is more efficient: summarize the messages you already have in memory
      const messagesToSummarize = allMessages.map((m) => ({
        type: isAIMessage(m) ? 'AI' : 'Human',
        content: m.content as string,
      }));

      // Progressive summarization is more token-efficient
      const newSummary = await createNewSummary(
        existingSummary,
        messagesToSummarize,
      );
      await saveSummary(sessionId, newSummary);
      await chatHistory.clear();
      console.log(`✅ Summary updated and short-term history cleared.`);
    }

    res.status(200).json({ answer: aiResponse.content });
  },
);

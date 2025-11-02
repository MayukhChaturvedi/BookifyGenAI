import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  StateGraph,
  END,
  START,
  MessagesAnnotation,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { BaseMessage } from '@langchain/core/messages';
import { GraphState } from './util/graphState.js';

// Import your existing tools
import checkStatusTool from './tools/checkStatusTool.js';
import requestBookTool from './tools/requestBookTool.js';
import findBooksByTopicTool from './tools/findBooksByTopicTool.js';
import findBooksByFilterTool from './tools/findBooksByFilterTool.js';
import generateStudyPlanTool from './tools/generateStudyPlanTool.js';

// Define the tools for the agent
const tools = [
  findBooksByFilterTool,
  findBooksByTopicTool,
  checkStatusTool,
  requestBookTool,
  generateStudyPlanTool,
];
const toolNode = new ToolNode<{ messages: BaseMessage[] }>(tools);

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: 'llama-3.3-70b-versatile',
  temperature: 0,
}).bindTools(tools);

/**
 * This function determines whether to continue the conversation or end it.
 */
const shouldContinue = (state: GraphState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  // If the last message is not an AI message with tool calls, then we end the conversation.
  if (
    !('tool_calls' in lastMessage.additional_kwargs) ||
    !lastMessage.additional_kwargs.tool_calls
  ) {
    return END;
  }
  // Otherwise, we continue by calling the tools.
  return 'tools';
};

/**
 * The primary node for our agent. It invokes the model with the current conversation state.
 */
const callModel = async (state: GraphState) => {
  const { messages, summary, userId } = state;
  const systemInstructions = `You are a helpful and friendly library assistant. Your primary goal is to assist users conversationally.

  **Your Core Instructions:**
  1.  **Always be conversational.** Your main purpose is to talk to the user, not to be an automated script.
  2.  **Use tools to get information.** Your tools help you find facts about the library's collection.
  3.  **Report tool results to the user.** After a tool runs, explain the result to the user in a natural way.

  **Specific Rule for Displaying Search Results:**
  - When either the 'findBooksByFilter' or 'findBooksByTopic' tool returns a list of books, you MUST format the book titles as Markdown links.
  - The JSON output from the tool will contain an 'id' for each book.
  - The URL for the link must follow this exact format: \`/books/<book_id>\`.
  - For example, if a book has the title "Dune" and the id "a1b2-c3d4", you must format it as: \`[Dune](/books/a1b2-c3d4)\`.
  - Present the results as a list.

  **Specific Rule for Not Finding a Book:**
  This is a non-negotiable, multi-step process:
  - **Step A:** If a user asks for a specific book and the 'findBooksByFilter' tool returns no results, your IMMEDIATE and ONLY next action is to formulate a sentence telling the user the book is not available.
  - **Step B:** In that SAME sentence, you MUST ask them a question, such as "Would you like me to request it for the library?".
  - **Step C:** You will then STOP and wait for the user's response.
  - **Step D:** You may ONLY call the 'requestBook' tool if the user responds with an affirmative answer like "yes" or "please do".`;

  const formattedHistory = messages
    .map((msg) => {
      // Check the type of message and label it accordingly
      if (msg._getType() === 'human') {
        return `User: ${msg.content}`;
      } else if (msg._getType() === 'ai') {
        // If the AI message has tool calls, represent them clearly
        const toolCalls =
          msg.additional_kwargs?.tool_calls
            ?.map(
              (tc) =>
                `Tool Call: ${tc.function.name}(${tc.function.arguments})`,
            )
            .join('\n') || '';
        return `Assistant: ${msg.content}\n${toolCalls}`;
      } else if (msg._getType() === 'tool') {
        return `Tool Result (for ${msg.name}): ${msg.content}`;
      }
      return '';
    })
    .join('\n\n');

  const finalPrompt = `
**System Instructions:**
${systemInstructions}

**Session Information:**
User ID: ${userId}

**Conversation Summary (Long-Term Memory):**
${summary || 'No prior conversation history for this session.'}

**Current Conversation (Short-Term Memory):**
${formattedHistory}

**Assistant's Turn:**
Now, generate the next response based on all the information above. When you call the 'requestBook' tool, you MUST use the User ID provided in the 'Session Information' section.
`;

  const response = await model.invoke([new HumanMessage(finalPrompt)]);
  // We return a list of messages to append to the existing state.
  return { messages: [response] };
};

// Define the graph workflow
const workflow = new StateGraph<GraphState>({
  channels: {
    messages: {
      value: (x, y) => x.concat(y), // Append new messages to the list
      default: () => [],
    },
    summary: {
      value: (x, y) => y ?? x, // Always take the new summary if provided
      default: () => '',
    },
    userId: {
      value: (x, y) => y ?? x, // Take the newest value if provided
      default: () => '',
    },
  },
})
  .addNode('agent', callModel)
  .addNode('tools', toolNode);

// Define the graph's entry point and edges
workflow.addEdge(START, 'agent');
workflow.addConditionalEdges('agent', shouldContinue);
workflow.addEdge('tools', 'agent');

// Compile the graph into a runnable object
export const app = workflow.compile();

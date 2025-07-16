import { BaseMessage } from '@langchain/core/messages';

export interface GraphState {
  messages: BaseMessage[];
  summary: string;
  userId: string;
}

import express from 'express';
import { chatWithAgent } from '../controllers/chatContoller.js';

const chatRouter = express.Router();

chatRouter.post('/', chatWithAgent);

export default chatRouter;

import { login, register, refresh } from '../controllers/userController.js';
import { Router } from 'express';

const userRouter = Router();
userRouter.post('/login', login);
userRouter.post('/register', register);
userRouter.post('/refresh', refresh);

export default userRouter;

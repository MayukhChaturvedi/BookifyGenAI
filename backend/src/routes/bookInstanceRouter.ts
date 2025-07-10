import { Router } from 'express';
import {
  getBookInstances,
  getBookInstanceById,
  createBookInstance,
  updateBookInstance,
  deleteBookInstance,
} from '../controllers/bookInstanceController.js';
import { authorizeRoles } from '../middlewares/authorize.js';

const bookInstanceRouter = Router();
bookInstanceRouter.get('/', getBookInstances);
bookInstanceRouter.get('/:id', getBookInstanceById);
bookInstanceRouter.post('/', authorizeRoles('admin'), createBookInstance);
bookInstanceRouter.put('/:id', authorizeRoles('admin'), updateBookInstance);
bookInstanceRouter.delete('/:id', authorizeRoles('admin'), deleteBookInstance);

export default bookInstanceRouter;

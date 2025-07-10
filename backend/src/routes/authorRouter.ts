import { Router } from 'express';
import {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../controllers/authorController.js';
import { authorizeRoles } from '../middlewares/authorize.js';

const authorRouter = Router();
authorRouter.get('/', getAuthors);
authorRouter.get('/:id', getAuthorById);
authorRouter.post('/', authorizeRoles('admin'), createAuthor);
authorRouter.put('/:id', authorizeRoles('admin'), updateAuthor);
authorRouter.delete('/:id', authorizeRoles('admin'), deleteAuthor);

export default authorRouter;

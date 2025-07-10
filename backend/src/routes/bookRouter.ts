import { Router } from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { authorizeRoles } from '../middlewares/authorize.js';

const bookRouter = Router();
bookRouter.get('/', getBooks);
bookRouter.get('/:id', getBookById);
bookRouter.post('/', authorizeRoles('admin'), createBook);
bookRouter.put('/:id', authorizeRoles('admin'), updateBook);
bookRouter.delete('/:id', authorizeRoles('admin'), deleteBook);

export default bookRouter;

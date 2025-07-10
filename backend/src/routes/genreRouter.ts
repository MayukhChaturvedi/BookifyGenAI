import { Router } from 'express';
import {
  getGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} from '../controllers/genreController.js';
import { authorizeRoles } from '../middlewares/authorize.js';

const genreRouter = Router();
genreRouter.get('/', getGenres);
genreRouter.get('/:id', getGenreById);
genreRouter.post('/', authorizeRoles('admin'), createGenre);
genreRouter.put('/:id', authorizeRoles('admin'), updateGenre);
genreRouter.delete('/:id', authorizeRoles('admin'), deleteGenre);

export default genreRouter;

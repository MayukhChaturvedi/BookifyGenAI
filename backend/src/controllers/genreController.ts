import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import sql from '../db/db.js';
import { v4 as uuidv4 } from 'uuid';
import { genreSchema } from '../validators/genreValidator.js';
import * as embeddingService from '../services/embeddingService.js';

interface Genre {
  id: string;
  name: string;
  description: string;
}

export const getGenres = asyncHandler(async (req: Request, res: Response) => {
  let page = Number(req.query.page);
  let limit = Number(req.query.limit);

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  page = safePage;
  limit = safeLimit;

  if (req.query.search && typeof req.query.search === 'string') {
    if (!req.query.search || req.query.search.trim() === '') {
      res.status(400).json({ message: 'Search query cannot be empty' });
      return;
    }
    const search = req.query.search.toString().trim().toLowerCase();
    const searchedGenres = await sql<Genre[]>`
        SELECT id, name, description
        FROM genres
        WHERE LOWER(name) LIKE ${`%${search}%`}
        ORDER BY name
        LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;
    const [countResultSearch] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM genres
        WHERE LOWER(name) LIKE ${`%${search}%`};
    `;
    res.status(200).json({
      genres: searchedGenres,
      totalCount: countResultSearch.count,
      page,
      limit,
    });
    return;
  }

  const genres = await sql<Genre[]>`
        SELECT id, name, description
        FROM genres
        ORDER BY name
        LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;
  const [countResult] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM genres;
    `;
  res.status(200).json({
    data: genres,
    totalCount: countResult.count,
    page,
    limit,
  });
});

export const getGenreById = asyncHandler(
  async (req: Request, res: Response) => {
    const genreId = req.params.id;

    const genre = await sql<Genre[]>`
        SELECT id, name, description
        FROM genres
        WHERE id = ${genreId};
    `;

    if (genre.length === 0) {
      res.status(404).json({ message: 'Genre not found' });
      return;
    }

    res.status(200).json(genre[0]);
  },
);

export const createGenre = asyncHandler(async (req: Request, res: Response) => {
  const parsed = genreSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, description } = parsed.data;
  const genreId = uuidv4();

  await sql`
    INSERT INTO genres (id, name, description)
    VALUES (${genreId}, ${name}, ${description});
  `;

  res.status(201).json({ id: genreId, name, description });
});

export const updateGenre = asyncHandler(async (req: Request, res: Response) => {
  const parsed = genreSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, description } = parsed.data;
  const genreId = req.params.id;

  const [updatedGenre] = await sql<Genre[]>`
    UPDATE genres
    SET name = ${name}, description = ${description}
    WHERE id = ${genreId}
    RETURNING id, name, description;
  `;

  if (!updatedGenre) {
    res.status(404).json({ message: 'Genre not found' });
    return;
  }

  embeddingService.updateGenreNameForBooks(genreId);

  res.status(200).json(updatedGenre);
});

export const deleteGenre = asyncHandler(async (req: Request, res: Response) => {
  const genreId = req.params.id;

  const result = await sql`
        DELETE FROM genres
        WHERE id = ${genreId};
    `;

  if (result.count === 0) {
    res.status(404).json({ message: 'Genre not found' });
    return;
  }

  res.status(204).send();
});

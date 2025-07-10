import { v4 } from 'uuid';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import sql from '../db/db.js';
import { authorSchema } from '../validators/authorValidator.js';

interface Author {
  id: string;
  name: string;
  bio: string;
}

export const getAuthors = asyncHandler(async (req: Request, res: Response) => {
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
    const search = req.query.search.toString().toLowerCase();
    const searchedAuthors = await sql<Author[]>`
        SELECT id, name, bio
        FROM authors
        WHERE LOWER(name) LIKE ${`%${search}%`}
        ORDER BY name
        LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;
    const [countResultSearch] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM authors
        WHERE LOWER(name) LIKE ${`%${search}%`};
    `;
    res.status(200).json({
      data: searchedAuthors,
      totalCount: countResultSearch.count,
      page,
      limit,
    });
    return;
  }

  const authors = await sql<Author[]>`
        SELECT id, name, bio
        FROM authors
        ORDER BY name
        LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;
  const [countResult] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM authors;
    `;
  console.log(authors);
  res.status(200).json({
    data: authors,
    totalCount: countResult.count,
    page,
    limit,
  });
});

export const getAuthorById = asyncHandler(
  async (req: Request, res: Response) => {
    const authorId = req.params.id;

    const author = await sql<Author[]>`
        SELECT id, name, bio
        FROM authors
        WHERE id = ${authorId};
    `;

    if (author.length === 0) {
      res.status(404).json({ message: 'Author not found' });
      return;
    }

    res.status(200).json(author[0]);
  },
);

export const createAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = authorSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: 'Invalid input',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, bio } = parsed.data;
    const authorId = v4();

    await sql`
      INSERT INTO authors (id, name, bio)
      VALUES (${authorId}, ${name}, ${bio});
    `;

    res.status(201).json({ id: authorId, name, bio });
  },
);

export const updateAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = authorSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: 'Invalid input',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, bio } = parsed.data;
    const authorId = req.params.id;

    const result = await sql`
      UPDATE authors
      SET name = ${name}, bio = ${bio}
      WHERE id = ${authorId};
    `;

    if (result.count === 0) {
      res.status(404).json({ message: 'Author not found' });
      return;
    }

    res.status(200).json({ id: authorId, name, bio });
  },
);

export const deleteAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    const authorId = req.params.id;

    const result = await sql`
        DELETE FROM authors
        WHERE id = ${authorId};
    `;

    if (result.count === 0) {
      res.status(404).json({ message: 'Author not found' });
      return;
    }

    res.status(204).send();
  },
);

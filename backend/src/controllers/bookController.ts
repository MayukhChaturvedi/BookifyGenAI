import { v4 } from 'uuid';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import sql from '../db/db.js';
import {
  bookCreateSchema,
  bookQuerySchema,
} from '../validators/bookValidator.js';

interface Book {
  id: string;
  title: string;
  author: string;
  author_id?: string;
  summary: string;
  genre: string;
  genre_id?: string;
}

export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = bookQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({
      message: 'Invalid query parameters',
      errors: parseResult.error.flatten(),
    });
    return;
  }

  const query = parseResult.data;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  if (query.search && typeof query.search === 'string') {
    if (!query.search || query.search.trim() === '') {
      res.status(400).json({ message: 'Search query cannot be empty' });
      return;
    }
    const search = query.search.toString().toLowerCase();
    const searchedBooks = await sql<Book[]>`
        SELECT b.id, b.title, b.author, b.summary, g.name AS genre
        FROM books AS b
        JOIN genres AS g ON b.genre = g.id
        WHERE LOWER(b.title) LIKE ${`%${search}%`}
        ORDER BY b.title
        LIMIT ${limit} OFFSET ${offset};
    `;
    const [countResultSearch] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM books
        WHERE LOWER(title) LIKE ${`%${search}%`};
    `;
    res.status(200).json({
      books: searchedBooks,
      totalCount: countResultSearch.count,
      page: page,
      limit: limit,
    });
    return;
  }

  if (query.author && typeof query.author === 'string') {
    const author = query.author.toString();
    const authorBooks = await sql<Book[]>`
        SELECT b.id, b.title, b.author AS author_id, a.name AS author, b.summary, b.genre AS genre_id, g.name AS genre
        FROM books AS b
        JOIN genres AS g ON b.genre = g.id
        JOIN authors AS a ON b.author = a.id
        WHERE b.author = ${author}
        ORDER BY b.title
        LIMIT ${limit} OFFSET ${offset};
    `;
    const [countResultAuthor] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM books
        WHERE author = ${author};
    `;
    res.status(200).json({
      books: authorBooks,
      totalCount: countResultAuthor.count,
      page: page,
      limit: limit,
    });
    return;
  }

  if (query.genre && typeof query.genre === 'string') {
    const genreId = query.genre.toString();
    const genreBooks = await sql<Book[]>`
        SELECT b.id, b.title, b.author AS author_id, a.name AS author, b.summary, b.genre AS genre_id, g.name AS genre
        FROM books AS b
        JOIN genres AS g ON b.genre = g.id
        JOIN authors AS a ON b.author = a.id
        WHERE g.id = ${genreId}
        ORDER BY b.title
        LIMIT ${limit} OFFSET ${offset};
    `;
    const [countResultGenre] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM books
        WHERE genre = ${genreId};
    `;
    res.status(200).json({
      books: genreBooks,
      totalCount: countResultGenre.count,
      page: page,
      limit: limit,
    });
    return;
  }
  // Default case: return all books

  const books = await sql<Book[]>`
        SELECT b.id, b.title, b.author AS author_id, a.name AS author, b.summary, b.genre AS genre_id, g.name AS genre
        FROM books AS b
        JOIN genres AS g ON b.genre = g.id
        JOIN authors AS a ON b.author = a.id
        ORDER BY b.title
        LIMIT ${limit} OFFSET ${offset};
    `;
  const [countResult] = await sql<[{ count: number }]>`
        SELECT COUNT(*) AS count
        FROM books;
    `;
  res.status(200).json({
    data: books,
    totalCount: countResult.count,
    page,
    limit,
  });
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const bookId = req.params.id;

  const book = await sql<Book[]>`
        SELECT b.id, b.title, b.author AS author_id, a.name AS author, b.summary, b.genre AS genre_id, g.name AS genre
        FROM books AS b
        JOIN genres AS g ON b.genre = g.id
        JOIN authors AS a ON b.author = a.id
        WHERE b.id = ${bookId};
    `;

  if (book.length === 0) {
    res.status(404).json({ message: 'Book not found' });
    return;
  }

  res.status(200).json(book[0]);
});

export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const result = bookCreateSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Validation failed', errors: result.error.flatten() });
    return;
  }

  const { title, author, summary, genre } = result.data;
  const newBookId = v4();

  await sql`
    INSERT INTO books (id, title, author, summary, genre)
    VALUES (${newBookId}, ${title}, ${author}, ${summary}, ${genre});
  `;

  res.status(201).json({ id: newBookId, title, author, summary, genre });
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const result = bookCreateSchema.safeParse(req.body); // Same fields
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Validation failed', errors: result.error.flatten() });
    return;
  }

  const { title, author, summary, genre } = result.data;
  const bookId = req.params.id;

  const resultSql = await sql`
    UPDATE books
    SET title = ${title}, author = ${author}, summary = ${summary}, genre = ${genre}
    WHERE id = ${bookId};
  `;

  if (resultSql.count === 0) {
    res.status(404).json({ message: 'Book not found' });
    return;
  }

  res.status(200).json({ id: bookId, title, author, summary, genre });
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const bookId = req.params.id;

  const result = await sql`
        DELETE FROM books
        WHERE id = ${bookId};
    `;

  if (result.count === 0) {
    res.status(404).json({ message: 'Book not found' });
    return;
  }

  res.status(204).send();
});

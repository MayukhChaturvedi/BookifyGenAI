import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import sql from '../db/db.js';
import {
  createBookInstanceSchema,
  updateBookInstanceSchema,
  paginationSchema,
} from '../validators/bookInstanceValidator.js';

interface BookInstance {
  id: string;
  book: string;
  status: 'Available' | 'Checked Out' | 'Reserved';
  dueDate: Date | null;
}

export const getBookInstances = asyncHandler(
  async (req: Request, res: Response) => {
    const query = paginationSchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ message: 'Invalid query parameters' });
      return;
    }

    let { page = '1', limit = '10', search } = query.data;
    const safePage = parseInt(page);
    const safeLimit = parseInt(limit);

    if (search?.trim()) {
      const searchLower = search.toLowerCase();
      const searchedBookInstances = await sql<BookInstance[]>`
      SELECT bi.id, b.title as book, bi.status, bi.due_date
      FROM bookinstances bi JOIN books b ON bi.book = b.id
      WHERE LOWER(book) LIKE ${`%${searchLower}%`}
      ORDER BY id
      LIMIT ${safeLimit} OFFSET ${(safePage - 1) * safeLimit};
    `;
      const [countResultSearch] = await sql<[{ count: number }]>`
      SELECT COUNT(*) AS count
      FROM bookinstances
      WHERE LOWER(bookId) LIKE ${`%${searchLower}%`};
    `;
      res.status(200).json({
        bookInstances: searchedBookInstances,
        totalCount: countResultSearch.count,
        page: safePage,
        limit: safeLimit,
      });
      return;
    }

    const bookInstances = await sql<BookInstance[]>`
    SELECT bi.id, b.title as book, bi.status, bi.due_date
    FROM bookinstances bi JOIN books b ON bi.book = b.id
    ORDER BY id
    LIMIT ${safeLimit} OFFSET ${(safePage - 1) * safeLimit};
  `;

    const [countResult] = await sql<[{ count: number }]>`
    SELECT COUNT(*) AS count FROM bookinstances;
  `;

    res.status(200).json({
      data: bookInstances,
      totalCount: countResult.count,
      page: safePage,
      limit: safeLimit,
    });
  },
);

export const getBookInstanceById = asyncHandler(
  async (req: Request, res: Response) => {
    const bookInstanceId = req.params.id;

    const bookInstance = await sql<BookInstance[]>`
        SELECT bi.id, b.title as book, bi.status, bi.due_date
        FROM bookinstances bi JOIN books b ON bi.book = b.id
        WHERE bi.id = ${bookInstanceId};
    `;

    if (bookInstance.length === 0) {
      res.status(404).json({ message: 'Book instance not found' });
      return;
    }

    res.status(200).json(bookInstance[0]);
  },
);

export const createBookInstance = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = createBookInstanceSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: 'Invalid input', errors: parsed.error.flatten() });
      return;
    }

    const { book, status, dueDate } = parsed.data;

    const newBookInstance: BookInstance = {
      id: uuidv4(),
      book,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    await sql`
    INSERT INTO bookinstances (id, book, status, due_date)
    VALUES (${newBookInstance.id}, ${newBookInstance.book}, ${newBookInstance.status}, ${newBookInstance.dueDate});
  `;

    res.status(201).json(newBookInstance);
  },
);

export const updateBookInstance = asyncHandler(
  async (req: Request, res: Response) => {
    const bookInstanceId = req.params.id;
    const parsed = updateBookInstanceSchema.safeParse(req.body);

    if (!parsed.success) {
      res
        .status(400)
        .json({ message: 'Invalid input', errors: parsed.error.flatten() });

      return;
    }

    const bookInstance = await sql<BookInstance[]>`
    SELECT id, book, status, due_date
    FROM bookinstances
    WHERE id = ${bookInstanceId};
  `;

    if (bookInstance.length === 0) {
      res.status(404).json({ message: 'Book instance not found' });
      return;
    }

    const existing = bookInstance[0];
    const { status, dueDate } = parsed.data;

    const updatedBookInstance: BookInstance = {
      ...existing,
      status: status ?? existing.status,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
    };

    await sql`
    UPDATE bookinstances
    SET status = ${updatedBookInstance.status}, due_date = ${updatedBookInstance.dueDate}
    WHERE id = ${bookInstanceId};
  `;

    res.status(200).json(updatedBookInstance);
  },
);

export const deleteBookInstance = asyncHandler(
  async (req: Request, res: Response) => {
    const bookInstanceId = req.params.id;

    const bookInstance = await sql<BookInstance[]>`
        SELECT id, book, status, due_date
        FROM bookinstances
        WHERE id = ${bookInstanceId};
    `;

    if (bookInstance.length === 0) {
      res.status(404).json({ message: 'Book instance not found' });
      return;
    }

    await sql`
        DELETE FROM bookinstances
        WHERE id = ${bookInstanceId};
    `;

    res.status(204).send();
  },
);

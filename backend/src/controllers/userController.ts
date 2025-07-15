import { v4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import sql from '../db/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';
import {
  loginSchema,
  registerSchema,
  refreshSchema,
} from '../validators/userValidator.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        session: string;
      };
    }
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ message: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await sql<User[]>`
    SELECT id, name, email, password, role
    FROM users
    WHERE email = ${email.trim().toLowerCase()}
  `;

    const isValid =
      user.length > 0 && (await bcrypt.compare(password, user[0].password));

    if (!isValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const sessionId = v4(); // Generate a new session ID

    const token = jwt.sign(
      {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        session: sessionId,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiration,
      },
    );

    const refreshToken = jwt.sign(
      { id: user[0].id, email: user[0].email, role: user[0].role },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiration },
    );

    res
      .status(200)
      .json({ access: token, refresh: refreshToken, role: user[0].role });
  },
);

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: parseResult.error.errors[0].message });
    return;
  }

  const { username, email, password, role } = parseResult.data;

  const existingUser = await sql<User[]>`
    SELECT id FROM users WHERE email = ${email.trim().toLowerCase()}
  `;

  if (existingUser.length > 0) {
    res.status(409).json({ message: 'Email already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = v4();

  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (${userId}, ${username}, ${email.trim().toLowerCase()}, ${hashedPassword}, ${role})
  `;

  res.status(201).json({ message: 'User registered successfully' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = refreshSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: parseResult.error.errors[0].message });
    return;
  }

  const { refresh } = parseResult.data;

  try {
    const decoded = jwt.verify(refresh, config.jwtRefreshSecret) as {
      id: string;
      email: string;
      role: string;
    };

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        session: v4(),
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiration,
      },
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiration },
    );

    res.status(200).json({ access: newAccessToken, refresh: newRefreshToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization header is required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        email: string;
        role: string;
        session: string;
      };
      const { exp } = jwt.decode(token) as { exp: number };

      if (!exp || exp < Math.floor(Date.now() / 1000)) {
        res.status(401).json({ message: 'Token has expired' });
        return;
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        session: decoded.session,
      };
      next();
    } catch {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  },
);

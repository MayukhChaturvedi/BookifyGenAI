import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import generateStudyPlanTool from '../agent/tools/generateStudyPlanTool.js';

// 1️⃣ Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'));
    }
    cb(null, true);
  },
});

// 2️⃣ Route handler: process uploaded file
export const uploadSyllabus = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    try {
      // Extract text from PDF
      const buffer = await fs.promises.readFile(file.path);
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      await parser.destroy();

      // Call the generateStudyPlanTool directly with the text
      const planJson = await generateStudyPlanTool.func({
        syllabusText: pdfData.text,
      });

      // Parse and respond
      const plan = JSON.parse(planJson);
      res.status(200).json(plan);
    } catch (error) {
      console.error('Error generating study plan:', error);
      res.status(500).json({
        message: 'Error generating study plan',
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      // Clean up uploaded file
      fs.promises.unlink(file.path);
    }
  },
);

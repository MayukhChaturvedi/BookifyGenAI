import { Router } from 'express';
import { uploadSyllabus, upload } from '../controllers/studyPlanController.js';

const studyPlanRouter = Router();

studyPlanRouter.post('/upload', upload.single('file'), uploadSyllabus);
// studyPlanRouter.post('/upload-syllabus', (req) => {
//   console.log(req);
// });

export default studyPlanRouter;

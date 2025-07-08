import express from 'express';
import { isAuth, isAdmin, isInstructorOrAdmin } from '../middlewares/isAuth.js';
import {
  createAssessment,
  updateAssessment,
  previewAssessment,
  activateAssessment,
  deactivateAssessment,
  listAssessments,
  getActiveAssessment,
  submitAssessment,
  checkEligibility,
  checkCertificateEligibility,
  getAllAttempts,
  getAttemptDetails,
  generateCertificate,
  downloadCertificate
} from '../controllers/assessment.js';

const router = express.Router();

// Admin routes
router.post('/admin/assessment', isAuth, isAdmin, createAssessment);
router.put('/admin/assessment/:id', isAuth, isAdmin, updateAssessment);
router.get('/admin/assessment/:id/preview', isAuth, isAdmin, previewAssessment);
router.patch('/admin/assessment/:id/activate', isAuth, isAdmin, activateAssessment);
router.patch('/admin/assessment/:id/deactivate', isAuth, isAdmin, deactivateAssessment);
router.get('/admin/assessments/:courseId', isAuth, isAdmin, listAssessments);
router.get('/admin/attempts/:courseId', isAuth, isAdmin, getAllAttempts);
router.get('/admin/attempt/:attemptId', isAuth, isAdmin, getAttemptDetails);

// User routes
router.get('/assessment/:courseId/active', isAuth, getActiveAssessment);
router.post('/assessment/:courseId/submit', isAuth, submitAssessment);
router.get('/assessment/:courseId/eligibility', isAuth, checkEligibility);
router.get('/certificate/:courseId/eligibility', isAuth, checkCertificateEligibility);

// Certificate routes
router.post('/certificate/:courseId/generate', isAuth, generateCertificate);
router.get('/certificate/:certificateId/download', isAuth, downloadCertificate);

// Instructor routes
router.get('/instructor/assessments/:courseId', isAuth, isInstructorOrAdmin, listAssessments);
router.patch('/instructor/assessment/:id/activate', isAuth, isInstructorOrAdmin, activateAssessment);
router.patch('/instructor/assessment/:id/deactivate', isAuth, isInstructorOrAdmin, deactivateAssessment);
router.get('/instructor/assessment/:id/preview', isAuth, isInstructorOrAdmin, previewAssessment);
router.put('/instructor/assessment/:id', isAuth, isInstructorOrAdmin, updateAssessment);
router.post('/instructor/assessment', isAuth, isInstructorOrAdmin, createAssessment);
router.delete('/instructor/assessment/:id', isAuth, isInstructorOrAdmin, async (req, res) => {
  // Use the same logic as admin delete (not shown in your code, but you can add a deleteAssessment controller if needed)
  const FinalAssessment = (await import('../models/FinalAssessment.js')).default;
  const assessment = await FinalAssessment.findById(req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  await assessment.deleteOne();
  res.json({ message: 'Assessment deleted successfully' });
});
router.get('/instructor/attempts/:courseId', isAuth, isInstructorOrAdmin, getAllAttempts);
router.get('/instructor/attempt/:attemptId', isAuth, isInstructorOrAdmin, getAttemptDetails);

export default router; 
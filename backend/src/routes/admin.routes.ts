import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
    createTestBank,
    getTestBanks,
    getTestBank,
    updateTestBank,
    deleteTestBank,
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    createAdminUser,
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject,
    createGroup,
    getGroups,
    updateGroup,
    deleteGroup,
    linkSubjectGroup,
    unlinkSubjectGroup,
    getSubjectGroups,
    getUsers,
    deleteUser,
    deleteAllAdmins,
    resetAdminPassword,
    createLessonScript,
    getLessonScripts,
    deleteLessonScript,
    generateQuestionsFromLessonScript,
    getStudentProgress,
} from '../controllers/admin.controller';

const router = Router();

router.get('/lesson-scripts', authMiddleware, requireRole(['admin', 'teacher', 'super_admin', 'student']), getLessonScripts);

router.use(authMiddleware, requireRole(['admin', 'teacher', 'super_admin']));

router.post('/users', requireRole(['super_admin']), createAdminUser);

router.get('/users/list', requireRole(['super_admin', 'admin']), getUsers);
router.delete('/users/:id', requireRole(['super_admin', 'admin']), deleteUser);
router.delete('/users/all', requireRole(['super_admin']), deleteAllAdmins);
router.post('/users/:id/reset-password', requireRole(['super_admin']), resetAdminPassword);

router.post('/subjects', requireRole(['super_admin', 'admin']), createSubject);
router.get('/subjects', getSubjects);
router.put('/subjects/:id', requireRole(['super_admin', 'admin']), updateSubject);
router.delete('/subjects/:id', requireRole(['super_admin', 'admin']), deleteSubject);

router.post('/groups', requireRole(['super_admin', 'admin']), createGroup);
router.get('/groups', getGroups);
router.put('/groups/:id', requireRole(['super_admin', 'admin']), updateGroup);
router.delete('/groups/:id', requireRole(['super_admin', 'admin']), deleteGroup);

router.post('/subject-groups', requireRole(['super_admin', 'admin']), linkSubjectGroup);
router.get('/subject-groups', getSubjectGroups);
router.delete('/subject-groups/:id', requireRole(['super_admin', 'admin']), unlinkSubjectGroup);

router.post('/lesson-scripts', requireRole(['super_admin', 'admin', 'teacher']), createLessonScript);
router.delete('/lesson-scripts/:id', requireRole(['super_admin', 'admin', 'teacher']), deleteLessonScript);
router.post('/lesson-scripts/:id/generate-questions', requireRole(['super_admin', 'admin', 'teacher']), generateQuestionsFromLessonScript);

router.get('/student-progress', getStudentProgress);

router.post('/tests', createTestBank);
router.get('/tests', getTestBanks);
router.get('/tests/:id', getTestBank);
router.put('/tests/:id', updateTestBank);
router.delete('/tests/:id', deleteTestBank);

router.post('/tests/:testId/questions', createQuestion);
router.get('/tests/:testId/questions', getQuestions);
router.put('/tests/:testId/questions/:questionId', updateQuestion);
router.delete('/tests/:testId/questions/:questionId', deleteQuestion);

export default router;

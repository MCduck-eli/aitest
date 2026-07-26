"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTestResult = exports.reportProctoringFail = exports.getSyllabus = exports.startExamByTopic = exports.verifyLiveFrame = exports.submitFullExam = void 0;
const ai_service_1 = require("../service/ai.service");
const telegram_service_1 = require("../service/telegram.service");
const syllabus_1 = require("../data/syllabus");
const database_1 = require("../config/database");
// Dars skriptining kontentini boyitish — qisqa bo'lsa syllabus dan qo'shib berish
const enrichScriptContent = (rawContent, subjectName) => {
    const isShort = !rawContent || rawContent.trim().length < 200;
    const looksLikeTopicList = /^[\d\-\.\s•\*]+[а-яa-zA-ZА-ЯёЁ]/m.test(rawContent)
        && rawContent.trim().split('\n').length < 15
        && rawContent.trim().length < 500;
    if (!isShort && !looksLikeTopicList) {
        return rawContent; // Kontent yaxshi, o'zgartirma
    }
    // Syllabusdan mos darslarni topib, keyKnowledge ni qo'sh
    const relevantLessons = syllabus_1.FoundationSyllabus.filter(lesson => {
        const subjectLower = subjectName.toLowerCase();
        const lessonNameLower = lesson.name.toLowerCase();
        if (subjectLower.includes('c++') || subjectLower.includes('cpp')) {
            return lesson.id >= 12 && lesson.id <= 22;
        }
        else if (subjectLower.includes('python')) {
            return lesson.id >= 23 && lesson.id <= 32;
        }
        else if (subjectLower.includes('kompyuter') || subjectLower.includes('foundation')) {
            return lesson.id >= 1 && lesson.id <= 11;
        }
        else if (subjectLower.includes('sql')) {
            return lesson.id === 37;
        }
        else if (subjectLower.includes('telegram') || subjectLower.includes('bot')) {
            return lesson.id >= 33 && lesson.id <= 36;
        }
        return true; // Hammasini qo'sh
    }).slice(0, 5);
    if (relevantLessons.length === 0)
        return rawContent;
    const enriched = relevantLessons
        .map(l => `${l.name}:\n${l.keyKnowledge || l.topics.join(', ')}`)
        .join('\n\n');
    return rawContent
        ? `${rawContent}\n\n=== QUYIDAGI BILIMLAR ASOSIDA SAVOL TUZING ===\n${enriched}`
        : enriched;
};
const handleError = (res, error, defaultMessage) => {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: defaultMessage });
};
const submitFullExam = async (req, res) => {
    try {
        const { studentName, examHistory, photo, photoBase64, violationCount } = req.body;
        if (!Array.isArray(examHistory) || examHistory.length === 0) {
            res.status(400).json({
                success: false,
                message: "Imtihon tarixi yuborilmadi.",
            });
            return;
        }
        const rawEvaluation = await (0, ai_service_1.evaluateFullExam)(examHistory);
        if (!rawEvaluation) {
            res.status(500).json({
                success: false,
                message: "AI baholashni amalga oshira olmadi.",
            });
            return;
        }
        const evaluation = typeof rawEvaluation.data === "string"
            ? JSON.parse(rawEvaluation.data)
            : rawEvaluation.data || rawEvaluation;
        const finalPhoto = photo || photoBase64 || "";
        const totalViolations = violationCount || 0;
        const isSuspicious = totalViolations > 3;
        const finalScore = Number(evaluation.finalScore) || 0;
        const status = isSuspicious || finalScore < 60 ? "failed" : "passed";
        try {
            await (0, telegram_service_1.sendTestReport)({
                studentName: studentName || "Ismsiz Talaba",
                score: finalScore,
                violations: totalViolations,
                status: status,
                reason: `🎓 AI Professor Xulosasi: ${evaluation.overallFeedback || "Baholash mavjud emas."} ${isSuspicious ? "\n⚠️ Qoida buzishlar ko'p." : ""}`,
                photoBase64: finalPhoto,
            });
        }
        catch (tgError) {
            console.error("Telegram error:", tgError);
        }
        res.status(200).json({ success: true, evaluation, isSuspicious });
    }
    catch (error) {
        handleError(res, error, "Imtihonni topshirishda server xatoligi yuz berdi.");
    }
};
exports.submitFullExam = submitFullExam;
const verifyLiveFrame = async (req, res) => {
    try {
        const finalPhoto = req.body.photo || req.body.photoBase64;
        const referenceDescription = req.body.referenceDescription;
        if (!finalPhoto) {
            res.status(400).json({
                success: false,
                message: "Rasm ma'lumoti topilmadi.",
            });
            return;
        }
        const result = await (0, ai_service_1.checkProctoringImage)(finalPhoto, referenceDescription);
        res.status(200).json({
            success: true,
            violationDetected: result.violationDetected,
            violationType: result.violationType,
            confidence: result.confidence,
            reason: result.reason,
            personDescription: result.personDescription,
            isCritical: result.isCritical,
        });
    }
    catch (error) {
        handleError(res, error, "AI xizmati vaqtinchalik ishlamayapti.");
    }
};
exports.verifyLiveFrame = verifyLiveFrame;
const startExamByTopic = async (req, res) => {
    try {
        const lessonScriptId = req.body.lessonScriptId;
        const selectedTopic = req.body.selectedTopic;
        if (lessonScriptId) {
            const scriptResult = await (0, database_1.query)(`SELECT ls.*, s.name as subject_name, g.name as group_name
                 FROM lesson_scripts ls
                 LEFT JOIN subjects s ON ls.subject_id = s.id
                 LEFT JOIN study_groups g ON ls.group_id = g.id
                 WHERE ls.id = $1`, [lessonScriptId]);
            if (scriptResult.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "Dars skripti topilmadi.",
                });
                return;
            }
            const lessonScript = scriptResult.rows[0];
            const subjectName = lessonScript.subject_name || 'Fan';
            const groupName = lessonScript.group_name || 'Guruh';
            // Kontent sifatsiz bo'lsa, syllabusdan boyitilgan kontentni qo'sh
            const enrichedContent = enrichScriptContent(lessonScript.content || '', subjectName);
            const questions = await (0, ai_service_1.generateQuestionsFromScript)(enrichedContent, subjectName, groupName, selectedTopic);
            if (!questions || (Array.isArray(questions) && questions.length === 0)) {
                res.status(500).json({
                    success: false,
                    message: "AI savollar generatsiya qilmadi. Iltimos, dars skriptini tekshiring.",
                });
                return;
            }
            const formattedQuestions = questions.map((q, index) => ({
                id: index + 1,
                text: q.question_text || q.text || q.question || "Savol matni topilmadi",
                question_type: q.question_type || "multiple_choice",
                difficulty_level: q.difficulty_level || "medium",
                options: q.options || [],
            }));
            res.json({
                success: true,
                questions: formattedQuestions,
                currentLesson: lessonScriptId,
                subject: subjectName,
                group: groupName,
            });
            return;
        }
        const rawLessonId = req.body.lessonId ?? req.body.topic;
        const lessonId = Number(rawLessonId);
        if (!rawLessonId || Number.isNaN(lessonId) || lessonId < 1) {
            res.status(400).json({
                success: false,
                message: "Dars raqami noto'g'ri kiritilgan.",
            });
            return;
        }
        const selectedLesson = (0, syllabus_1.getLessonById)(lessonId);
        if (!selectedLesson) {
            res.status(404).json({
                success: false,
                message: "Tanlangan dars topilmadi.",
            });
            return;
        }
        const coveredLessons = (0, syllabus_1.getLessonsUpTo)(lessonId);
        const coveredTopics = (0, syllabus_1.getTopicsUpToLesson)(lessonId);
        if (coveredTopics.length === 0) {
            res.status(404).json({
                success: false,
                message: "Tanlangan dars uchun mavzular topilmadi.",
            });
            return;
        }
        const questions = await (0, ai_service_1.generateQuestionsByTopic)(lessonId, coveredLessons, coveredTopics);
        if (!questions ||
            (Array.isArray(questions) && questions.length === 0)) {
            res.status(404).json({
                success: false,
                message: "Savollar generatsiya qilinmadi.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            currentLesson: lessonId,
            lessonName: selectedLesson.name,
            coveredLessons: coveredLessons.map((lesson) => ({
                id: lesson.id,
                name: lesson.name,
            })),
            topics: coveredTopics,
            questions,
        });
    }
    catch (error) {
        handleError(res, error, "Savollarni yuklashda xatolik yuz berdi.");
    }
};
exports.startExamByTopic = startExamByTopic;
const getSyllabus = async (req, res) => {
    if (!syllabus_1.FoundationSyllabus) {
        res.status(404).json({
            success: false,
            message: "Dastur (syllabus) topilmadi.",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: syllabus_1.FoundationSyllabus,
        categories: syllabus_1.SubjectCategories,
    });
};
exports.getSyllabus = getSyllabus;
const reportProctoringFail = async (req, res) => {
    try {
        const { studentName, reason, photoBase64 } = req.body;
        try {
            await (0, telegram_service_1.sendTestReport)({
                studentName: studentName || "Ismsiz Talaba",
                score: 0,
                violations: 99,
                status: "failed",
                reason: reason || "Qoidabuzarlik aniqlandi",
                photoBase64: photoBase64 || "",
            });
        }
        catch (tgError) {
            console.error("Telegram error:", tgError);
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        handleError(res, error, "Qoidabuzarlik hisoboti yuborishda xatolik yuz berdi.");
    }
};
exports.reportProctoringFail = reportProctoringFail;
const submitTestResult = async (req, res) => {
    try {
        const { studentId, testId, answers } = req.body;
        if (!studentId || !testId || !answers) {
            res.status(400).json({
                success: false,
                message: "Kerakli ma'lumotlar to'liq emas.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Natijalar muvaffaqiyatli saqlandi.",
        });
    }
    catch (error) {
        handleError(res, error, "Natijalarni saqlashda server xatoligi yuz berdi.");
    }
};
exports.submitTestResult = submitTestResult;

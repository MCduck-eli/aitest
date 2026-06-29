import { Request, Response } from "express";
import {
    evaluateFullExam,
    checkProctoringImage,
    generateQuestionsByTopic,
} from "../service/ai.service";
import { sendTestReport } from "../service/telegram.service";
import {
    FoundationSyllabus,
    SubjectCategories,
    getLessonById,
    getLessonsUpTo,
    getTopicsUpToLesson,
} from "../data/syllabus";

const handleError = (
    res: Response,
    error: any,
    defaultMessage: string,
): void => {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: defaultMessage });
};

interface SubmitFullExamBody {
    studentName?: string;
    examHistory?: any[];
    photo?: string;
    photoBase64?: string;
    violationCount?: number;
}

interface VerifyFrameBody {
    photo?: string;
    photoBase64?: string;
    referenceDescription?: string;
}

interface StartExamBody {
    lessonId?: number;
    topic?: string;
}

interface SubmitTestResultBody {
    studentId?: string;
    testId?: string;
    answers?: any;
}

interface ReportProctoringFailBody {
    studentName?: string;
    reason?: string;
    photoBase64?: string;
}

export const submitFullExam = async (
    req: Request<{}, {}, SubmitFullExamBody>,
    res: Response,
): Promise<void> => {
    try {
        const { studentName, examHistory, photo, photoBase64, violationCount } =
            req.body;

        if (!Array.isArray(examHistory) || examHistory.length === 0) {
            res.status(400).json({
                success: false,
                message: "Imtihon tarixi yuborilmadi.",
            });
            return;
        }

        const rawEvaluation: any = await evaluateFullExam(examHistory);

        if (!rawEvaluation) {
            res.status(500).json({
                success: false,
                message: "AI baholashni amalga oshira olmadi.",
            });
            return;
        }

        const evaluation =
            typeof rawEvaluation.data === "string"
                ? JSON.parse(rawEvaluation.data)
                : rawEvaluation.data || rawEvaluation;

        const finalPhoto = photo || photoBase64 || "";
        const totalViolations = violationCount || 0;
        const isSuspicious = totalViolations > 3;
        const finalScore = Number(evaluation.finalScore) || 0;
        const status = isSuspicious || finalScore < 60 ? "failed" : "passed";

        try {
            await sendTestReport({
                studentName: studentName || "Ismsiz Talaba",
                score: finalScore,
                violations: totalViolations,
                status: status,
                reason: `🎓 AI Professor Xulosasi: ${evaluation.overallFeedback || "Baholash mavjud emas."} ${isSuspicious ? "\n⚠️ Qoida buzishlar ko'p." : ""}`,
                photoBase64: finalPhoto,
            });
        } catch (tgError) {
            console.error("Telegram error:", tgError);
        }

        res.status(200).json({ success: true, evaluation, isSuspicious });
    } catch (error) {
        handleError(
            res,
            error,
            "Imtihonni topshirishda server xatoligi yuz berdi.",
        );
    }
};

export const verifyLiveFrame = async (
    req: Request<{}, {}, VerifyFrameBody>,
    res: Response,
): Promise<void> => {
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

        const result = await checkProctoringImage(
            finalPhoto,
            referenceDescription,
        );

        res.status(200).json({
            success: true,
            violationDetected: result.violationDetected,
            violationType: result.violationType,
            confidence: result.confidence,
            reason: result.reason,
            personDescription: result.personDescription,
            isCritical: result.isCritical,
        });
    } catch (error) {
        handleError(res, error, "AI xizmati vaqtinchalik ishlamayapti.");
    }
};

export const startExamByTopic = async (
    req: Request<{}, {}, StartExamBody>,
    res: Response,
): Promise<void> => {
    try {
        const rawLessonId = req.body.lessonId ?? req.body.topic;
        const lessonId = Number(rawLessonId);

        if (!rawLessonId || Number.isNaN(lessonId) || lessonId < 1) {
            res.status(400).json({
                success: false,
                message: "Dars raqami noto'g'ri kiritilgan.",
            });
            return;
        }

        const selectedLesson = getLessonById(lessonId);

        if (!selectedLesson) {
            res.status(404).json({
                success: false,
                message: "Tanlangan dars topilmadi.",
            });
            return;
        }

        const coveredLessons = getLessonsUpTo(lessonId);
        const coveredTopics = getTopicsUpToLesson(lessonId);

        if (coveredTopics.length === 0) {
            res.status(404).json({
                success: false,
                message: "Tanlangan dars uchun mavzular topilmadi.",
            });
            return;
        }

        const questions = await generateQuestionsByTopic(
            lessonId,
            coveredLessons,
            coveredTopics,
        );

        if (
            !questions ||
            (Array.isArray(questions) && questions.length === 0)
        ) {
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
    } catch (error) {
        handleError(res, error, "Savollarni yuklashda xatolik yuz berdi.");
    }
};

export const getSyllabus = async (
    req: Request,
    res: Response,
): Promise<void> => {
    if (!FoundationSyllabus) {
        res.status(404).json({
            success: false,
            message: "Dastur (syllabus) topilmadi.",
        });
        return;
    }

    res.status(200).json({
        success: true,
        data: FoundationSyllabus,
        categories: SubjectCategories,
    });
};

export const reportProctoringFail = async (
    req: Request<{}, {}, ReportProctoringFailBody>,
    res: Response,
): Promise<void> => {
    try {
        const { studentName, reason, photoBase64 } = req.body;

        try {
            await sendTestReport({
                studentName: studentName || "Ismsiz Talaba",
                score: 0,
                violations: 99,
                status: "failed",
                reason: reason || "Qoidabuzarlik aniqlandi",
                photoBase64: photoBase64 || "",
            });
        } catch (tgError) {
            console.error("Telegram error:", tgError);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        handleError(
            res,
            error,
            "Qoidabuzarlik hisoboti yuborishda xatolik yuz berdi.",
        );
    }
};

export const submitTestResult = async (
    req: Request<{}, {}, SubmitTestResultBody>,
    res: Response,
): Promise<void> => {
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
    } catch (error) {
        handleError(
            res,
            error,
            "Natijalarni saqlashda server xatoligi yuz berdi.",
        );
    }
};

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "../../lib/api";

interface Question {
    id: number;
    text: string;
}

interface QuestionCardProps {
    questions: Question[];
    currentLesson: string;
    onFinishExam: (
        history: Array<{ question: string; answer: string }>,
        photoBase64: string | null,
        violationCount: number,
    ) => void;
    onForceFail: (reason: string, photoBase64: string | null) => void;
}

const VOICE_VOLUME_THRESHOLD = 18;
const VOICE_SPEECH_THRESHOLD = 16;
const VOICE_SUSTAINED_MS = 1200;
const VOICE_BURST_MIN_MS = 450;
const VOICE_BURST_LIMIT = 3;
const VOICE_BURST_WINDOW_MS = 60000;
const PROCTORING_INTERVAL_MS = 1500; // Kuchaytirildi: 3s -> 1.5s
const CRITICAL_CONFIDENCE = 50; // Kuchaytirildi: 35 -> 50
const LOOKING_AWAY_CONFIDENCE = 80; // Kuchaytirildi: 70 -> 80

export default function QuestionCard({
    questions,
    currentLesson,
    onFinishExam,
    onForceFail,
}: QuestionCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [examHistory, setExamHistory] = useState<
        Array<{ question: string; answer: string }>
    >([]);

    const [violationsCount, setViolationsCount] = useState(0);
    const [proctoringStatus, setProctoringStatus] = useState(
        "Kamera va mikrofon yuklanmoqda...",
    );
    const [warning, setWarning] = useState<string | null>(null);

    const violationsRef = useRef(0);
    const isExamActive = useRef(true);
    const referencePersonRef = useRef<string>("");
    const voiceStartRef = useRef<number | null>(null);
    const voiceBurstTimestampsRef = useRef<number[]>([]);
    const isCheckingFrameRef = useRef(false);
    const lastAnswerLengthRef = useRef(0);

    const examHistoryRef = useRef<Array<{ question: string; answer: string }>>(
        [],
    );

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const permissionRequestTimeRef = useRef<number | null>(null);

    const triggerWarning = (msg: string) => {
        setWarning(msg);
        setTimeout(() => setWarning(null), 5000);
    };

    const takeSnapshot = (): string | null => {
        if (
            videoRef.current &&
            canvasRef.current &&
            videoRef.current.videoWidth > 0
        ) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const width = 640;
            const height = 480;

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");
            if (context) {
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "medium";
                context.drawImage(video, 0, 0, width, height);
                return canvas.toDataURL("image/jpeg", 0.7);
            }
        }
        return null;
    };

    const stopMedia = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (
            audioContextRef.current &&
            audioContextRef.current.state !== "closed"
        ) {
            audioContextRef.current.close().catch(() => {});
        }
        if (audioIntervalRef.current) {
            clearInterval(audioIntervalRef.current);
        }
    };

    const triggerForceFail = useCallback(
        (reason: string, frame: string | null) => {
            if (!isExamActive.current) return;
            isExamActive.current = false;
            stopMedia();
            onForceFail(reason, frame);
        },
        [onForceFail],
    );

    const registerViolation = useCallback(
        (
            reason: string,
            frame: string | null,
            options?: { immediate?: boolean },
        ) => {
            if (!isExamActive.current) return;

            if (options?.immediate) {
                triggerForceFail(reason, frame);
                return;
            }

            violationsRef.current += 1;
            setViolationsCount(violationsRef.current);
            setProctoringStatus("⚠️ Qoidabuzarlik aniqlandi");

            if (violationsRef.current >= 3) {
                triggerForceFail(
                    `Ko'p martalik qoidabuzarlik: ${reason}`,
                    frame,
                );
            } else {
                triggerWarning(
                    `Ogohlantirish (${violationsRef.current}/3): ${reason}`,
                );
            }
        },
        [triggerForceFail],
    );

    const registerVoiceViolation = useCallback(
        (reason: string) => {
            if (!isExamActive.current) return;
            const frame = takeSnapshot();
            triggerForceFail(reason, frame);
        },
        [triggerForceFail],
    );

    const handleProctoringResult = useCallback(
        (data: {
            violationDetected?: boolean;
            violationType?: string;
            confidence?: number;
            reason?: string;
            personDescription?: string;
            isCritical?: boolean;
        }) => {
            if (!data.violationDetected) {
                if (data.personDescription && !referencePersonRef.current) {
                    referencePersonRef.current = data.personDescription;
                }
                return;
            }

            const frame = takeSnapshot();
            const confidence = Number(data.confidence) || 0;
            const violationType = data.violationType || "unknown";
            const reason = data.reason || "Qoidabuzarlik aniqlandi";

            const normalizedReason = `${reason} ${data.personDescription || ""}`.toLowerCase();
            const mentionsCriticalCue = [
                "phone",
                "mobile",
                "smartphone",
                "tablet",
                "another person",
                "other person",
                "nearby person",
                "someone beside",
                "assistant",
                "help",
                "helper",
                "suhbat",
                "yordam",
                "screen",
                "monitor",
                "second screen",
                "paper",
                "book",
                "notebook",
                "daftar",
                "qog'oz",
                "reading",
                "copy",
                "cheat",
            ].some((term) => normalizedReason.includes(term));

            const isImmediateCriticalViolation =
                (data.isCritical ||
                    [
                        "phone",
                        "external_help",
                        "multiple_persons",
                        "device_cheat",
                        "reading_material",
                        "screen_copy",
                        "person_swap",
                    ].includes(violationType) ||
                    mentionsCriticalCue) &&
                confidence >= CRITICAL_CONFIDENCE;

            if (isImmediateCriticalViolation) {
                triggerForceFail(`Qat'iy qoidabuzarlik: ${reason}`, frame);
                return;
            }

            if (violationType === "no_person" && confidence >= 55) { // Kuchaytirildi: 65 -> 55
                triggerForceFail("Yuz aniqlanmadi — imtihon to'xtatildi.", frame); // Darrov bloklash
                return;
            }

            if (
                violationType === "looking_away" &&
                confidence >= LOOKING_AWAY_CONFIDENCE
            ) {
                triggerForceFail(
                    "Ko'zlaringiz ekranga qaratilmagan — imtihon to'xtatildi.",
                    frame,
                );
                return;
            }

            if (confidence >= 50) { // Kuchaytirildi: 60 -> 50
                registerViolation(reason, frame);
            }
        },
        [registerViolation, triggerForceFail],
    );

    const verifyFrame = useCallback(async () => {
        if (!isExamActive.current || isCheckingFrameRef.current) return;

        const frame = takeSnapshot();
        if (!frame || frame.length <= 500) return;

        const cleanBase64 = frame.includes(",") ? frame.split(",")[1] : frame;

        isCheckingFrameRef.current = true;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/tests/verify-frame`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        photoBase64: cleanBase64,
                        referenceDescription:
                            referencePersonRef.current || undefined,
                    }),
                },
            );

            const data = await response.json();
            if (!isExamActive.current) return;

            if (data.success) {
                handleProctoringResult(data);
            }
        } catch (err) {
        } finally {
            isCheckingFrameRef.current = false;
        }
    }, [handleProctoringResult]);

    const startAudioMonitoring = useCallback(async () => {
        if (!streamRef.current || audioContextRef.current) return;

        try {
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as Window & {
                        webkitAudioContext?: typeof AudioContext;
                    }
                ).webkitAudioContext;
            const audioContext = new AudioContextClass();

            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }

            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(
                streamRef.current,
            );

            analyser.fftSize = 2048;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            setProctoringStatus("🟢 Kamera va ovoz nazorati faol");

            const bufferLength = analyser.fftSize;
            const timeData = new Uint8Array(bufferLength);
            const freqData = new Uint8Array(analyser.frequencyBinCount);

            audioIntervalRef.current = setInterval(() => {
                if (!isExamActive.current) return;

                analyser.getByteTimeDomainData(timeData);
                analyser.getByteFrequencyData(freqData);

                let totalSquares = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const normalized = (timeData[i] - 128) / 128;
                    totalSquares += normalized * normalized;
                }

                const volumeValue =
                    Math.sqrt(totalSquares / bufferLength) * 100;

                let speechEnergy = 0;
                const speechStart = 8;
                const speechEnd = 80;
                for (let i = speechStart; i < speechEnd; i++) {
                    speechEnergy += freqData[i];
                }
                const speechScore = speechEnergy / (speechEnd - speechStart);

                const isVoiceDetected =
                    volumeValue > VOICE_VOLUME_THRESHOLD &&
                    speechScore > VOICE_SPEECH_THRESHOLD;

                if (isVoiceDetected) {
                    if (!voiceStartRef.current) {
                        voiceStartRef.current = Date.now();
                    }

                    const voiceDuration = Date.now() - voiceStartRef.current;

                    if (voiceDuration >= VOICE_SUSTAINED_MS) {
                        registerVoiceViolation(
                            "Ovoz orqali yordam olish yoki suhbat aniqlandi.",
                        );
                        return;
                    }

                    setProctoringStatus(
                        "⚠️ Ovoz aniqlandi — yordam olish taqiqlanadi",
                    );
                } else if (voiceStartRef.current) {
                    const burstDuration = Date.now() - voiceStartRef.current;
                    if (burstDuration >= VOICE_BURST_MIN_MS) {
                        const now = Date.now();
                        voiceBurstTimestampsRef.current = [
                            ...voiceBurstTimestampsRef.current.filter(
                                (ts) => now - ts < VOICE_BURST_WINDOW_MS,
                            ),
                            now,
                        ];

                        if (
                            voiceBurstTimestampsRef.current.length >=
                            VOICE_BURST_LIMIT
                        ) {
                            registerVoiceViolation(
                                "Takroriy ovoz — yordam olish yoki gaplashish aniqlandi.",
                            );
                            return;
                        }

                        registerViolation(
                            "Ovoz aniqlandi — yordam olish taqiqlanadi.",
                            takeSnapshot(),
                        );
                    }
                    voiceStartRef.current = null;
                }
            }, 250);
        } catch (audioErr) {
        }
    }, [registerViolation, registerVoiceViolation]);

    const handleAnswerChange = (value: string) => {
        const prevLength = lastAnswerLengthRef.current;
        const addedChars = value.length - prevLength;

        if (addedChars > 30 && prevLength > 0) { // Kuchaytirildi: 40 -> 30
            triggerForceFail( // Darrov bloklash
                "Katta hajmdagi matn qo'shildi — nusxa ko'chirish shubhasi.",
                takeSnapshot(),
            );
            return;
        }

        lastAnswerLengthRef.current = value.length;
        setAnswer(value);
    };

    useEffect(() => {
        let isMounted = true;
        permissionRequestTimeRef.current = Date.now();
        navigator.mediaDevices
            .getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user",
                },
                audio: true,
            })
            .then(async (mediaStream) => {
                if (!isMounted) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(() => {});
                }
                setProctoringStatus("🟢 AI Kamera faol");
                await startAudioMonitoring();
                setTimeout(() => {
                    verifyFrame();
                }, 2000);
            })
            .catch(() =>
                triggerForceFail("Kamera/Mikrofonga ruxsat yo'q.", null),
            );

        const handleVisibilityChange = () => {
            if (!isExamActive.current) return;
            // ignore brief visibility changes caused by permission prompt
            const now = Date.now();
            if (
                permissionRequestTimeRef.current &&
                now - permissionRequestTimeRef.current < 3000
            ) {
                return;
            }
            if (document.hidden) {
                const currentFrame = takeSnapshot();
                registerViolation(
                    "Sahifadan chiqish taqiqlanadi.",
                    currentFrame,
                    { immediate: true },
                );
            }
        };

        const handleWindowBlur = () => {
            if (!isExamActive.current) return;
            const now = Date.now();
            if (
                permissionRequestTimeRef.current &&
                now - permissionRequestTimeRef.current < 3000
            ) {
                return;
            }
            registerViolation("Imtihon oynasidan chiqildi.", takeSnapshot(), {
                immediate: true,
            });
        };

        const handlePaste = (event: ClipboardEvent) => {
            if (!isExamActive.current) return;
            event.preventDefault();
            registerViolation(
                "Nusxa ko'chirish (paste) taqiqlanadi.",
                takeSnapshot(),
                { immediate: true },
            );
        };

        const handleCopy = (event: ClipboardEvent) => {
            if (!isExamActive.current) return;
            event.preventDefault();
            registerViolation("Matn nusxalash taqiqlanadi.", takeSnapshot());
        };

        const handleCut = (event: ClipboardEvent) => {
            if (!isExamActive.current) return;
            event.preventDefault();
            registerViolation("Matn kesish taqiqlanadi.", takeSnapshot());
        };

        const handleContextMenu = (event: MouseEvent) => {
            if (!isExamActive.current) return;
            event.preventDefault();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isExamActive.current) return;

            const key = event.key.toLowerCase();
            const withMeta = event.ctrlKey || event.metaKey;

            if (
                (withMeta &&
                    ["c", "v", "x", "a", "u", "s", "p"].includes(key)) ||
                key === "f12" ||
                (withMeta && event.shiftKey && ["i", "j", "c"].includes(key))
            ) {
                event.preventDefault();
                if (key === "v") {
                    registerViolation(
                        "Klaviatura orqali nusxa ko'chirish taqiqlanadi.",
                        takeSnapshot(),
                        { immediate: true },
                    );
                } else {
                    registerViolation(
                        "Taqiqlangan klaviatura kombinatsiyasi.",
                        takeSnapshot(),
                    );
                }
            }
        };

        const handleDrop = (event: DragEvent) => {
            if (!isExamActive.current) return;
            event.preventDefault();
            registerViolation(
                "Fayl tashlash yoki tashqi matn kiritish taqiqlanadi.",
                takeSnapshot(),
                { immediate: true },
            );
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("cut", handleCut);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("drop", handleDrop);

        const proctoringInterval = setInterval(() => {
            verifyFrame();
        }, PROCTORING_INTERVAL_MS);

        const focusInterval = setInterval(() => {
            if (!isExamActive.current) return;
            if (!document.hasFocus()) {
                registerViolation(
                    "Diqqat imtihon oynasidan uzildi.",
                    takeSnapshot(),
                );
            }
        }, 3000);

        return () => {
            isMounted = false;
            clearInterval(proctoringInterval);
            clearInterval(focusInterval);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            window.removeEventListener("blur", handleWindowBlur);
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("cut", handleCut);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("drop", handleDrop);
            document.exitFullscreen?.().catch(() => {});
            stopMedia();
        };
    }, [
        registerViolation,
        startAudioMonitoring,
        triggerForceFail,
        verifyFrame,
    ]);

    return (
        <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl z-10 relative">
            {warning && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-rose-500/90 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl animate-bounce">
                    {warning}
                </div>
            )}

            <div className="absolute top-4 right-4 w-24 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black opacity-80 z-20">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />
            </div>

            <div className="mb-4 flex flex-col gap-2">
                <div>
                    <span
                        className={`text-xs font-mono px-3 py-1 rounded-md ${violationsCount > 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}
                    >
                        {proctoringStatus} ({violationsCount}/3)
                    </span>
                </div>
            </div>

            <div className="mb-6 flex justify-between items-center pr-28">
                {questions && questions[currentIndex] && (
                    <div>
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                            {currentLesson}-dars
                        </span>
                        <h2 className="text-xl font-semibold mt-1 text-slate-200">
                            {questions[currentIndex].text}
                        </h2>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <textarea
                    ref={textareaRef}
                    className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-slate-600 transition-colors resize-none"
                    value={answer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="Javobingizni shu yerga yozing..."
                />
                <button
                    onClick={() => {
                        if (!questions || !questions[currentIndex]) return;
                        verifyFrame();
                        const newHistory = [
                            ...examHistory,
                            {
                                question: questions[currentIndex].text,
                                answer,
                            },
                        ];
                        examHistoryRef.current = newHistory;

                        if (currentIndex < questions.length - 1) {
                            setCurrentIndex((prev) => prev + 1);
                            setExamHistory(newHistory);
                            setAnswer("");
                            lastAnswerLengthRef.current = 0;
                        } else {
                            setWarning("😊 Kulib turing, rasmga olamiz...");
                            setProctoringStatus(
                                "😊 Kulib turing, rasmga olamiz...",
                            );
                            const finalPhoto = takeSnapshot();
                            isExamActive.current = false;
                            stopMedia();
                            onFinishExam(
                                newHistory,
                                finalPhoto,
                                violationsRef.current,
                            );
                        }
                    }}
                    className="w-full bg-linear-to-r from-cyan-600 to-blue-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99]"
                >
                    {currentIndex === questions.length - 1
                        ? "Tugatish"
                        : "Keyingisi"}
                </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

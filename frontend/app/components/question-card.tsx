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
const FACE_CHECK_INTERVAL_MS = 1500;

// Load MediaPipe Face Detection from CDN
function loadMediaPipeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") { reject(); return; }
        if ((window as any).__mediapipeFaceDetectionLoaded) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js";
        script.crossOrigin = "anonymous";
        script.onload = () => {
            (window as any).__mediapipeFaceDetectionLoaded = true;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load TF.js + COCO-SSD object detection from CDN
function loadCocoSsd(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") { reject(); return; }
        if ((window as any).__cocoSsdLoaded) { resolve(); return; }

        const loadScript = (src: string) =>
            new Promise<void>((res, rej) => {
                const s = document.createElement("script");
                s.src = src;
                s.crossOrigin = "anonymous";
                s.onload = () => res();
                s.onerror = rej;
                document.head.appendChild(s);
            });

        loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js")
            .then(() => loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js"))
            .then(() => {
                (window as any).__cocoSsdLoaded = true;
                resolve();
            })
            .catch(reject);
    });
}

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
    const voiceStartRef = useRef<number | null>(null);
    const voiceBurstTimestampsRef = useRef<number[]>([]);
    const lastAnswerLengthRef = useRef(0);
    const examHistoryRef = useRef<Array<{ question: string; answer: string }>>([]);
    const faceDetectionRef = useRef<any>(null);
    const faceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const cocoModelRef = useRef<any>(null);
    const noFaceCountRef = useRef(0);
    const mediaPipeReadyRef = useRef(false);
    const objCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = 640;
            canvas.height = 480;
            const context = canvas.getContext("2d");
            if (context) {
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "medium";
                context.drawImage(video, 0, 0, 640, 480);
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
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close().catch(() => {});
        }
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
        if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
        if (objCheckIntervalRef.current) clearInterval(objCheckIntervalRef.current);
        if (faceDetectionRef.current) {
            try { faceDetectionRef.current.close(); } catch {}
            faceDetectionRef.current = null;
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
        (reason: string, frame: string | null) => {
            if (!isExamActive.current) return;
            violationsRef.current += 1;
            setViolationsCount(violationsRef.current);
            setProctoringStatus("⚠️ Qoidabuzarlik aniqlandi");
            triggerForceFail(`Qoidabuzarlik: ${reason}`, frame);
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

    // ─── MediaPipe Face Detection (Browser CDN) ───────────────────────────────
    const initFaceDetection = useCallback(async () => {
        try {
            await loadMediaPipeScript();
            const FaceDetection = (window as any).FaceDetection;
            if (!FaceDetection) {
                setProctoringStatus("🟢 Kamera nazorati faol (asosiy)");
                return;
            }

            const fd = new FaceDetection({
                locateFile: (file: string) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
            });

            fd.setOptions({
                model: "short",
                minDetectionConfidence: 0.5,
            });

            fd.onResults((results: any) => {
                if (!isExamActive.current) return;
                const detections = results.detections || [];

                if (detections.length === 0) {
                    noFaceCountRef.current += 1;
                    if (noFaceCountRef.current >= 2) {
                        // 2 consecutive no-face frames → block
                        triggerForceFail(
                            "Yuz aniqlanmadi — imtihon to'xtatildi.",
                            takeSnapshot(),
                        );
                    } else {
                        setProctoringStatus("⚠️ Yuz ko'rinmayapti...");
                    }
                } else if (detections.length >= 2) {
                    noFaceCountRef.current = 0;
                    triggerForceFail(
                        "Kadrda bir nechta odam aniqlandi — imtihon to'xtatildi.",
                        takeSnapshot(),
                    );
                } else {
                    noFaceCountRef.current = 0;
                    // Check if face is looking away by checking bounding box center
                    const box = detections[0].boundingBox;
                    if (box) {
                        const centerX = box.xCenter;
                        // If face center is too far left or right → looking away
                        if (centerX < 0.2 || centerX > 0.8) {
                            triggerForceFail(
                                "Ko'zlaringiz ekranda emas — imtihon to'xtatildi.",
                                takeSnapshot(),
                            );
                            return;
                        }
                    }
                    setProctoringStatus("🟢 AI Kamera nazorati faol");
                }
            });

            await fd.initialize();
            faceDetectionRef.current = fd;
            mediaPipeReadyRef.current = true;
            setProctoringStatus("🟢 AI Kamera nazorati faol");
        } catch (e) {
            console.warn("MediaPipe yuklanmadi:", e);
            setProctoringStatus("🟢 Kamera nazorati faol");
        }
    }, [triggerForceFail]);

    // Run face detection on video frame
    const checkFace = useCallback(async () => {
        if (!isExamActive.current) return;
        if (!faceDetectionRef.current || !videoRef.current) return;
        if (videoRef.current.videoWidth === 0) return;
        try {
            await faceDetectionRef.current.send({ image: videoRef.current });
        } catch {}
    }, []);

    // ─── COCO-SSD Object Detection (phone, book, laptop) ─────────────────────
    const initObjectDetection = useCallback(async () => {
        try {
            await loadCocoSsd();
            const cocoSsd = (window as any).cocoSsd;
            if (!cocoSsd) {
                console.warn("cocoSsd global not found");
                return;
            }
            console.log("Loading COCO-SSD model...");
            // Use mobilenet_v2 (more accurate than lite version)
            const model = await cocoSsd.load({ base: "mobilenet_v2" });
            cocoModelRef.current = model;
            console.log("✅ COCO-SSD ready");
        } catch (e) {
            console.warn("COCO-SSD yuklanmadi:", e);
        }
    }, []);

    const checkObjects = useCallback(async () => {
        if (!isExamActive.current) return;
        if (!cocoModelRef.current || !videoRef.current) return;
        if (videoRef.current.videoWidth === 0) return;
        try {
            const predictions: Array<{ class: string; score: number }> =
                await cocoModelRef.current.detect(videoRef.current);

            // Log all detections for debugging
            if (predictions.length > 0) {
                console.log("COCO detections:", predictions.map(p => `${p.class}(${(p.score * 100).toFixed(0)}%)`).join(", "));
            }

            const BANNED = ["cell phone", "book", "laptop", "tv", "remote"];
            const frame = takeSnapshot();

            // Count persons
            const persons = predictions.filter((p) => p.class === "person" && p.score > 0.6);
            if (persons.length >= 2) {
                triggerForceFail("Kadrda bir nechta odam aniqlandi — imtihon to'xtatildi.", frame);
                return;
            }

            // Check for banned objects - lower threshold to 0.30
            for (const pred of predictions) {
                if (BANNED.includes(pred.class) && pred.score > 0.30) {
                    // Map COCO labels to Uzbek
                    // NOTE: COCO often misclassifies daftar/book as "laptop"
                    // and phone as "remote", so we group them accordingly
                    const label =
                        pred.class === "cell phone" || pred.class === "remote"
                            ? "📱 Telefon"
                            : pred.class === "book" || pred.class === "laptop"
                            ? "📚 Kitob / Daftar"
                            : pred.class === "tv"
                            ? "🖥️ Ekran / Monitor"
                            : `🚫 Taqiqlangan narsa`;
                    triggerForceFail(
                        `${label} aniqlandi — imtihon to'xtatildi.`,
                        frame,
                    );
                    return;
                }
            }
        } catch (e) {
            console.warn("COCO check error:", e);
        }
    }, [triggerForceFail]);

    const startAudioMonitoring = useCallback(async () => {
        if (!streamRef.current || audioContextRef.current) return;
        try {
            const AudioContextClass =
                window.AudioContext ||
                (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            const audioContext = new AudioContextClass();
            if (audioContext.state === "suspended") await audioContext.resume();

            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(streamRef.current);
            analyser.fftSize = 2048;
            source.connect(analyser);
            audioContextRef.current = audioContext;

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
                const volumeValue = Math.sqrt(totalSquares / bufferLength) * 100;

                let speechEnergy = 0;
                for (let i = 8; i < 80; i++) speechEnergy += freqData[i];
                const speechScore = speechEnergy / 72;

                const isVoiceDetected =
                    volumeValue > VOICE_VOLUME_THRESHOLD && speechScore > VOICE_SPEECH_THRESHOLD;

                if (isVoiceDetected) {
                    if (!voiceStartRef.current) voiceStartRef.current = Date.now();
                    const voiceDuration = Date.now() - voiceStartRef.current;
                    if (voiceDuration >= VOICE_SUSTAINED_MS) {
                        registerVoiceViolation("Ovoz orqali yordam olish yoki suhbat aniqlandi.");
                        return;
                    }
                    setProctoringStatus("⚠️ Ovoz aniqlandi — yordam olish taqiqlanadi");
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
                        if (voiceBurstTimestampsRef.current.length >= VOICE_BURST_LIMIT) {
                            registerVoiceViolation("Takroriy ovoz — yordam olish yoki gaplashish aniqlandi.");
                            return;
                        }
                        registerViolation("Ovoz aniqlandi — yordam olish taqiqlanadi.", takeSnapshot());
                    }
                    voiceStartRef.current = null;
                }
            }, 250);
        } catch {}
    }, [registerViolation, registerVoiceViolation]);

    const handleAnswerChange = (value: string) => {
        const prevLength = lastAnswerLengthRef.current;
        const addedChars = value.length - prevLength;
        if (addedChars > 30 && prevLength > 0) {
            triggerForceFail("Katta hajmdagi matn qo'shildi — nusxa ko'chirish shubhasi.", takeSnapshot());
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
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
                audio: true,
            })
            .then(async (mediaStream) => {
                if (!isMounted) { mediaStream.getTracks().forEach((t) => t.stop()); return; }
                streamRef.current = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(() => {});
                }
                setProctoringStatus("🟢 AI Kamera faol");
                await startAudioMonitoring();

                // Wait for video to be ready then init face detection
                setTimeout(async () => {
                    if (!isMounted) return;
                    await initFaceDetection();

                    // Start face detection interval
                    faceCheckIntervalRef.current = setInterval(() => {
                        checkFace();
                    }, FACE_CHECK_INTERVAL_MS);

                    // Init COCO-SSD object detection (phone, book, laptop)
                    await initObjectDetection();
                    objCheckIntervalRef.current = setInterval(() => {
                        checkObjects();
                    }, 500);
                }, 2000);
            })
            .catch(() => triggerForceFail("Kamera/Mikrofonga ruxsat yo'q.", null));

        const handleVisibilityChange = () => {
            if (!isExamActive.current) return;
            const now = Date.now();
            if (permissionRequestTimeRef.current && now - permissionRequestTimeRef.current < 3000) return;
            if (document.hidden) {
                registerViolation("Sahifadan chiqish taqiqlanadi.", takeSnapshot());
            }
        };

        const handleWindowBlur = () => {
            if (!isExamActive.current) return;
            const now = Date.now();
            if (permissionRequestTimeRef.current && now - permissionRequestTimeRef.current < 3000) return;
            registerViolation("Imtihon oynasidan chiqildi.", takeSnapshot());
        };

        const handlePaste = (event: ClipboardEvent) => {
            if (!isExamActive.current) return;
            event.preventDefault();
            registerViolation("Nusxa ko'chirish (paste) taqiqlanadi.", takeSnapshot());
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
                (withMeta && ["c", "v", "x", "a", "u", "s", "p"].includes(key)) ||
                key === "f12" ||
                (withMeta && event.shiftKey && ["i", "j", "c"].includes(key))
            ) {
                event.preventDefault();
                if (key === "v") {
                    registerViolation("Klaviatura orqali nusxa ko'chirish taqiqlanadi.", takeSnapshot());
                } else {
                    registerViolation("Taqiqlangan klaviatura kombinatsiyasi.", takeSnapshot());
                }
            }
        };

        const handleDrop = (event: DragEvent) => {
            if (!isExamActive.current) return;
            event.preventDefault();
            registerViolation("Fayl tashlash yoki tashqi matn kiritish taqiqlanadi.", takeSnapshot());
        };

        const focusInterval = setInterval(() => {
            if (!isExamActive.current) return;
            if (!document.hasFocus()) {
                registerViolation("Diqqat imtihon oynasidan uzildi.", takeSnapshot());
            }
        }, 3000);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("cut", handleCut);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("drop", handleDrop);

        return () => {
            isMounted = false;
            clearInterval(focusInterval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
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
        initFaceDetection,
        checkFace,
        initObjectDetection,
        checkObjects,
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
                        {proctoringStatus}
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
                        const newHistory = [
                            ...examHistory,
                            { question: questions[currentIndex].text, answer },
                        ];
                        examHistoryRef.current = newHistory;

                        if (currentIndex < questions.length - 1) {
                            setCurrentIndex((prev) => prev + 1);
                            setExamHistory(newHistory);
                            setAnswer("");
                            lastAnswerLengthRef.current = 0;
                        } else {
                            setWarning("😊 Kulib turing, rasmga olamiz...");
                            setProctoringStatus("😊 Kulib turing, rasmga olamiz...");
                            const finalPhoto = takeSnapshot();
                            isExamActive.current = false;
                            stopMedia();
                            onFinishExam(newHistory, finalPhoto, violationsRef.current);
                        }
                    }}
                    className="w-full bg-linear-to-r from-cyan-600 to-blue-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99]"
                >
                    {currentIndex === questions.length - 1 ? "Tugatish" : "Keyingisi"}
                </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

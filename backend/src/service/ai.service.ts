    import OpenAI from "openai";
    import dotenv from "dotenv";

    dotenv.config();

    const groqClient = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
        timeout: 30000,
    });

    const GROQ_MODEL = "llama-3.3-70b-versatile";
    const VISION_MODEL =
        process.env.GROQ_VISION_MODEL ??
        "meta-llama/llama-4-scout-17b-16e-instruct";

    const CRITICAL_VIOLATIONS = new Set([
        "multiple_persons",
        "phone",
        "person_swap",
        "device_cheat",
        "external_help",
        "reading_material",
        "screen_copy",
    ]);

    const VALID_VIOLATION_TYPES = new Set([
        "none",
        "multiple_persons",
        "phone",
        "no_person",
        "person_swap",
        "device_cheat",
        "external_help",
        "reading_material",
        "screen_copy",
        "looking_away",
    ]);

    const CRITICAL_SIGNAL_TERMS = [
        "phone",
        "mobile",
        "smartphone",
        "tablet",
        "another person",
        "other person",
        "nearby person",
        "someone beside",
        "helper",
        "help",
        "assistant",
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
        "suhbat",
        "yordam",
    ];

    const normalizeImageUrl = (photoBase64: string): string => {
        if (photoBase64.startsWith("data:image")) {
            return photoBase64;
        }
        return `data:image/jpeg;base64,${photoBase64}`;
    };

    export const checkProctoringImage = async (
        photoBase64: string,
        referenceDescription?: string,
    ) => {
        try {
            const referenceHint = referenceDescription
                ? `Ro'yxatdan o'tgan talaba: "${referenceDescription}". Yuz shakli, jinsi, yoshi, soch rangi, ko'zoynak, kiyim va boshqa belgilar bo'yicha solishtiring. Har qanday shubhali farq bo'lsa person_swap deb belgilang.`
                : "Birinchi marta tekshirilmoqda. Talaba yuzini, sochini, kiyimini va boshqa aniq belgilarni personDescription ga yozing.";

            const response = await groqClient.chat.completions.create({
                model: VISION_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `Siz qattiq imtihon proctoring tizimisiz. Kameradan olingan kadrni diqqat bilan tahlil qiling va qoidabuzarliklarni aniqlang.

    QOIDABUZARLIK TURLARI:
    1. multiple_persons — kadrda 2+ odam, yon tomonda bosh/el ko'rinishi, ortda odam, aks yoki soya
    2. phone — telefon, smartfon, planshet, quloqchin bilan telefon ishlatish, stolda telefon, qo'lda telefon (qisman ko'rinsa ham)
    3. no_person — hech kim yo'q, yuz yopiq, kamera yopilgan, faqat orqa fon
    4. person_swap — imtihon topshirayotgan talaba boshqa odamga almashgan (yuz, jins, yosh, soch, kiyim farqi)
    5. device_cheat — ikkinchi ekran, noutbuk, planshetdan nusxa ko'chirish, telefon ekraniga qarash, klaviaturadan emas boshqa joydan yozish
    6. external_help — yon tomondan yordam, ko'rsatib turish, birga javob yozish, qo'l yoki barmoq bilan ishora, yon tomondan suhbat
    7. reading_material — qog'oz, daftar, kitob, varaq, qo'l/yoqa ustidagi yozuvlardan o'qish
    8. screen_copy — monitor, televizor, ikkinchi ekrandan o'qish, ekran yonida nusxa ko'chirish harakati
    9. looking_away — ko'zlar ekrandan uzoqlashgan, bosh o'ng/chapga yoki pastga burilgan, yuz ekrandan uzoq tomonga qaratilgan; agar ko'zlar 2-3 soniya davomida ekrandan uzilgan bo'lsa, bu yuqori ishonch bilan looking_away deb belgilang.

    QATTIQ QOIDALAR:
    - Telefon qisman ko'rinsa ham phone deb belgilang. Agar telefon ko'rinsa, hatto kichik bo'lsa ham qoldirmang.
    - Boshqa odamning qo'li, yelkasi, boshi, yuzlari yoki biror kishi yon tomondan ko'rsatilayotgan bo'lsa external_help yoki multiple_persons deb belgilang.
    - Odamning boshqa tomondan javob ko'rsatishi, ishorasi, birga yozishi, ko'rsatib turishi yoki suhbat qilishi external_help deb belgilang.
    - Qog'oz/daftar/kitob ko'rinsa reading_material
    - Ikkinchi ekran, noutbuk, planshet yoki ekran ko'rinsa screen_copy yoki device_cheat
    - person_swap faqat reference bilan solishtirganda ishonchli bo'lsa
    - Agar rasmda yordam olish belgisi bo'lsa, hatto aniq bo'lmasa ham external_help ni yuqori ishonch bilan belgilang.

    ${referenceHint}

    Faqat JSON qaytaring:
    {
    "violationDetected": boolean,
    "violationType": "none" | "multiple_persons" | "phone" | "no_person" | "person_swap" | "device_cheat" | "external_help" | "reading_material" | "screen_copy" | "looking_away",
    "confidence": number,
    "reason": string,
    "personDescription": string
    }`,
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Imtihon paytida olingan kadrni tekshiring. Telefon, yordam, nusxa ko'chirish va odam almashishni qidir.",
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: normalizeImageUrl(photoBase64),
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
            });

            const content = response.choices[0].message.content || "{}";
            const parsed = JSON.parse(content);

            const rawType = parsed.violationType || "none";
            const violationType = VALID_VIOLATION_TYPES.has(rawType)
                ? rawType
                : "none";
            const confidence = Number(parsed.confidence) || 0;
            const reasonText =
                `${parsed.reason || ""} ${parsed.personDescription || ""} ${rawType || ""}`.toLowerCase();
            const mentionsCriticalCue = CRITICAL_SIGNAL_TERMS.some((term) =>
                reasonText.includes(term),
            );

            let resolvedType = violationType;
            if (resolvedType === "none") {
                if (
                    reasonText.includes("phone") ||
                    reasonText.includes("mobile") ||
                    reasonText.includes("smartphone") ||
                    reasonText.includes("tablet")
                ) {
                    resolvedType = "phone";
                } else if (
                    reasonText.includes("help") ||
                    reasonText.includes("assistant") ||
                    reasonText.includes("suhbat") ||
                    reasonText.includes("yordam") ||
                    reasonText.includes("another person") ||
                    reasonText.includes("other person") ||
                    reasonText.includes("nearby person") ||
                    reasonText.includes("someone beside")
                ) {
                    resolvedType = "external_help";
                } else if (
                    reasonText.includes("screen") ||
                    reasonText.includes("monitor") ||
                    reasonText.includes("second screen")
                ) {
                    resolvedType = "screen_copy";
                } else if (
                    reasonText.includes("paper") ||
                    reasonText.includes("book") ||
                    reasonText.includes("notebook") ||
                    reasonText.includes("daftar") ||
                    reasonText.includes("qog'oz") ||
                    reasonText.includes("reading")
                ) {
                    resolvedType = "reading_material";
                }
            }

            const isCriticalType = CRITICAL_VIOLATIONS.has(resolvedType);
            const violationDetected =
                Boolean(parsed.violationDetected) ||
                (isCriticalType && confidence >= 35) ||
                (resolvedType !== "none" &&
                    mentionsCriticalCue &&
                    confidence >= 40);

            return {
                violationDetected,
                violationType: resolvedType,
                confidence: Math.max(confidence, isCriticalType ? 70 : confidence),
                reason: parsed.reason || "",
                personDescription: parsed.personDescription || "",
                isCritical: isCriticalType,
            };
        } catch (error) {
            return {
                violationDetected: false,
                violationType: "none",
                confidence: 0,
                reason: "Vision tahlil vaqtincha ishlamadi",
                personDescription: "",
                isCritical: false,
            };
        }
    };

    export const evaluateFullExam = async (examHistory: any) => {
        try {
            const response = await groqClient.chat.completions.create({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: "system",
                        content:
                            "Siz ekspert o'qituvchisiz. Talabaning imtihon javoblarini tahlil qilib, ball (finalScore) va feedback (overallFeedback) bering. Javobni faqat JSON formatida qaytaring.",
                    },
                    {
                        role: "user",
                        content: `Quyidagi imtihon tarixi bo'yicha baholash va tahlil qiling: ${JSON.stringify(examHistory)}`,
                    },
                ],
                response_format: { type: "json_object" },
            });

            return {
                status: "success",
                data: response.choices[0].message.content,
            };
        } catch (error) {
            return {
                status: "error",
                message: "Baholashni amalga oshirib bo'lmadi",
            };
        }
    };

    export const generateQuestionsFromScript = async (
        lessonScript: string,
        subject?: string,
        studyGroup?: string,
        selectedTopic?: string,
    ) => {
        try {
            const restrictionPrompt = selectedTopic
                ? `\n⚠️ CHEKLOV: Faqat "${selectedTopic}" mavzusigacha bo'lgan qismdan savol tuz.`
                : "";

            const scriptInfo = lessonScript && lessonScript.trim().length > 50
                ? `DARS SKRIPTI MATNI:\n${lessonScript}`
                : `DARS MAVZUSI: ${subject || "IT texnologiyalar"}\nEslat: Skript qisqa, umumiy bilimlar asosida savol tuz.`;

            const response = await groqClient.chat.completions.create({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `Siz ${subject || "IT"} fanidan test muallifisiz. Quyidagi dars skripti asosida 5 ta test savoli tuzing.${restrictionPrompt}

🔴 MUTLAQO TAQIQLANGAN — bu turdagi savollar HECH QACHON bo'lmasin:
• "Bu dars/kurs/skript nima haqida?" — YO'Q
• "N-darsning mavzusi nima?" — YO'Q
• "Kursning birinchi/ikkinchi mavzusi nima?" — YO'Q
• "Bu kursda nima o'rganiladi?" — YO'Q
• Dars raqami, kurs nomi, o'quv rejasi haqida har qanday savol — YO'Q

✅ FAQAT BUNDAY SAVOLLAR TUZING (skriptdagi haqiqiy bilimdan):
• "Excel da yig'indi formulasi qaysi?" → =SUM()
• "C++ da ekranga chiqarish operatori?" → cout
• "Ikkilik 1010 o'nlikda qancha?" → 10
• "Python da listga element qo'shish?" → append()
• "Blok sxemada shart qaysi shakl bilan belgilanadi?" → Romb
• "DNS ning vazifasi nima?" → Domen nomini IP ga aylantirish

QOIDALAR:
- Savollar faqat O'ZBEK TILIDA
- Har bir savolga 4 ta javob varianti
- Faqat BITTA to'g'ri javob
- Savollar aniq va qisqa bo'lsin
- Javob variantlari bir-biriga o'xshamasin

JSON formatida qaytaring:
{
  "questions": [
    {
      "question_text": "Savol matni",
      "question_type": "multiple_choice",
      "difficulty_level": "medium",
      "options": [
        { "text": "A variant", "isCorrect": false },
        { "text": "To'g'ri javob", "isCorrect": true },
        { "text": "C variant", "isCorrect": false },
        { "text": "D variant", "isCorrect": false }
      ]
    }
  ]
}`,
                    },
                    {
                        role: "user",
                        content: scriptInfo,
                    },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });

            const content = response.choices[0].message.content || '{"questions": []}';
            const parsed = JSON.parse(content);
            return Array.isArray(parsed.questions) ? parsed.questions : [];
        } catch (error) {
            return [];
        }
    };

    export const extractTopicsFromScript = async (lessonScript: string) => {
        try {
            const response = await groqClient.chat.completions.create({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `Siz professional o'qituvchisiz. Berilgan dars skriptidan (mavzular va dars rejalaridan) tartiblangan darslar/mavzular ro'yxatini ajratib oling.
    Har bir dars/mavzu uchun quyidagi JSON formatida faqat JSON javob qaytaring. Boshqa hech qanday matn qo'shmang.
    JSON formati:
    {
    "topics": [
        {
        "id": 1,
        "name": "1-dars: Mavzu nomi",
        "description": "Mavzu bo'yicha qisqacha tavsif yoki reja"
        }
    ]
    }`,
                    },
                    {
                        role: "user",
                        content: `Dars skripti:\n${lessonScript}`,
                    },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
            });

            const content = response.choices[0].message.content || '{"topics": []}';
            const parsed = JSON.parse(content);
            return Array.isArray(parsed.topics) ? parsed.topics : [];
        } catch (error) {
            return [];
        }
    };

export const generateQuestionsByTopic = async (
    lessonId: number,
    lessons: Array<{ id: number; name: string; topics: string[]; keyKnowledge?: string }>,
    topics: string[],
) => {
    try {
        // Har bir dars uchun haqiqiy bilim kontenti bilan batafsil blok
        const lessonDetails = lessons
            .map(
                (lesson) =>
                    `=== ${lesson.id}-DARS: ${lesson.name.replace(/^\d+-dars:\s*/i, '')} ===\n` +
                    `Mavzular: ${lesson.topics.join(", ")}\n` +
                    (lesson.keyKnowledge ? `Bu darsda o'rganilgan bilimlar:\n${lesson.keyKnowledge.trim()}` : ""),
            )
            .join("\n\n");

        const questionCount = 5;

        const response = await groqClient.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                {
                    role: "system",
                    content: `Siz test muallifisiz. Quyida darslar kontenti berilgan. Shu kontentdan ${questionCount} ta test savoli tuzing.

🔴 TAQIQLANGAN: dars raqami, dars nomi, kurs haqida savollar
✅ RUHSAT BERILGAN: formulalar, sintaksis, konversiya, amallar, tushunchalar qisqa savollari

QOIDALAR: o'zbek tilida, 4 ta variant, bitta to'g'ri javob, qisqa matn

Javobni faqat quyidagi JSON formatida qaytaring:
{
    "questions": [
        { "id": 1, "text": "Savol matni", "options": ["A variant", "B variant", "C variant", "D variant"], "correct": 0 }
    ]
}`,
                },
                {
                    role: "user",
                    content: `Quyidagi darslar o'tildi. Har bir darsning bilim kontentidan savol tuzing:\n\n${lessonDetails}`,
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const content =
            response.choices[0].message.content || '{"questions": []}';
        const parsed = JSON.parse(content);
        const rawQuestions = Array.isArray(parsed.questions)
            ? parsed.questions
            : [];

        return rawQuestions.map((question: any, index: number) => {
            const options = Array.isArray(question.options)
                ? question.options.filter(
                    (option: unknown) => typeof option === "string",
                )
                : [];
            const text =
                typeof question.text === "string"
                    ? question.text.trim()
                    : typeof question.question === "string"
                    ? question.question.trim()
                    : "";
            const correct = Number(question.correct ?? 0);

            return {
                id: Number(question.id ?? index + 1),
                text,
                options: options.slice(0, 4),
                correct: Number.isNaN(correct) ? 0 : correct,
            };
        });
    } catch (error) {
        return [];
    }
};
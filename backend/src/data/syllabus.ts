export interface Lesson {
    id: number;
    name: string;
    topics: string[];
}

export interface SubjectCategory {
    id: string;
    name: string;
    fromLesson: number;
    toLesson: number;
}

export const SubjectCategories: SubjectCategory[] = [
    {
        id: "foundation",
        name: "Kompyuter savodxonligi",
        fromLesson: 1,
        toLesson: 11,
    },
    {
        id: "cpp",
        name: "C++ dasturlash",
        fromLesson: 12,
        toLesson: 22,
    },
    {
        id: "python",
        name: "Python dasturlash",
        fromLesson: 23,
        toLesson: 32,
    },
    {
        id: "telegram-bot",
        name: "Telegram bot",
        fromLesson: 33,
        toLesson: 36,
    },
    {
        id: "sql",
        name: "SQL va ma'lumotlar bazasi",
        fromLesson: 37,
        toLesson: 37,
    },
];

export const FoundationSyllabus: Lesson[] = [
    {
        id: 1,
        name: "1-dars: Kursga kirish",
        topics: ["Dars jarayonlari", "Kirish qismi"],
    },
    {
        id: 2,
        name: "2-dars: IT kompaniyalar haqida",
        topics: ["Global va mahalliy IT bozor", "Kompaniyalar iyerarxiyasi"],
    },
    {
        id: 3,
        name: "3-dars: Operatsion Sistema & Typing",
        topics: [
            "Windows/Linux/MacOS asoslari",
            "Klaviatura simulyatorlari",
            "Tez yozish qoidalari",
        ],
    },
    {
        id: 4,
        name: "4-dars: Office dasturlari",
        topics: ["Word", "Excel", "PowerPoint asoslari"],
    },
    {
        id: 5,
        name: "5-dars: Internet & Sun’iy intelekt",
        topics: [
            "Internet qanday ishlaydi",
            "AI vositalari",
            "Prompt engineering",
        ],
    },
    {
        id: 6,
        name: "6-dars: Canva dasturi",
        topics: ["Grafik dizayn elementlari", "Canva vositalari bilan ishlash"],
    },
    {
        id: 7,
        name: "7-dars: Animatsiya, video va yakuniy taqdimot",
        topics: ["Video montaj asoslari", "Pitch deck va taqdimot tayyorlash"],
    },
    {
        id: 8,
        name: "8-dars: Axborot & Sanoq tizimlari",
        topics: ["Axborot turlari", "Sanoq tizimlari tushunchasi"],
    },
    {
        id: 9,
        name: "9-dars: Sanoq tizimlar",
        topics: [
            "Ikkilik",
            "O'nlik",
            "O'n oltilik sanoq tizimlari",
            "Biridan ikkinchisiga o'tkazish",
        ],
    },
    {
        id: 10,
        name: "10-dars: Algoritm & Blok sxemalar",
        topics: ["Algoritm qoidalari", "Blok sxema elementlari"],
    },
    {
        id: 11,
        name: "11-dars: Chiziqli algoritm, Tarmoqlanuvchi, Takrorlanuvchi algoritm",
        topics: ["Algoritm turlari va mantiqiy tuzilmalar"],
    },
    {
        id: 12,
        name: "12-dars: C++ dasturlash tiliga kirish",
        topics: ["C++ sintaksisi", "cout va cin operatorlari", "Ilk dastur"],
    },
    {
        id: 13,
        name: "13-dars: Ma’lumot turlari – Data types",
        topics: [
            "int",
            "float",
            "double",
            "char",
            "bool",
            "C++ o'zgaruvchilari",
        ],
    },
    {
        id: 14,
        name: "14-dars: Tarmoqlanuvchi operatorlar",
        topics: ["if", "else if", "else", "switch case operatorlari"],
    },
    {
        id: 15,
        name: "15-dars: Sikl operatorlari (Loop)",
        topics: ["for", "while", "do while tsikllari"],
    },
    {
        id: 16,
        name: "16-dars: Sikl va shart operatori ishlatilish",
        topics: ["Murakkab masalalar", "Sikl ichida shart tekshirish"],
    },
    {
        id: 17,
        name: "17-dars: Cmath va String kutubxonalari",
        topics: ["Matematik funksiyalar", "Satrlar bilan ishlash metodlari"],
    },
    {
        id: 18,
        name: "18-dars: Funksiya (Function) - 1",
        topics: ["Funksiya yaratish", "Parametrlar va return tushunchasi"],
    },
    {
        id: 19,
        name: "19-dars: Funksiya (Function) - 2",
        topics: ["Void funksiyalar", "Global va lokal o'zgaruvchilar"],
    },
    {
        id: 20,
        name: "20-dars: Massiv",
        topics: ["Bir o'lchamli massivlar", "Massiv elementlarini indekslash"],
    },
    {
        id: 21,
        name: "21-dars: Massiv va Funksiya. Tizim 1",
        topics: ["Massivlarni funksiyaga uzatish", "Algoritmik masalalar"],
    },
    {
        id: 22,
        name: "22-dars: Tizim 2 va Vector kutubxonasi",
        topics: ["Dinamik massivlar", "Vector metodlari (push_back, pop_back)"],
    },
    {
        id: 23,
        name: "23-dars: Python dasturlash tiliga kirish",
        topics: ["Python o'rnatish", "print va input", "Sintaksis farqlari"],
    },
    {
        id: 24,
        name: "24-dars: Ma’lumot turlari – Data types",
        topics: ["int", "float", "str", "bool dynamic typing in Python"],
    },
    {
        id: 25,
        name: "25-dars: Shart va Shartli operatorlar",
        topics: ["if", "elif", "else mantiqiy operatorlar and/or/not"],
    },
    {
        id: 26,
        name: "26-dars: Sikl operatorlari (Loop)",
        topics: ["for in", "while", "range funksiyasi"],
    },
    {
        id: 27,
        name: "27-dars: Funksiya (Function)",
        topics: ["def kalit so'zi", "Python funksiyalari"],
    },
    {
        id: 28,
        name: "28-dars: Pythonda tayyor funksiyalar",
        topics: ["len", "max", "min", "sum", "abs va boshqa built-in metodlar"],
    },
    {
        id: 29,
        name: "29-dars: Toplamlar va Listlar",
        topics: ["List (ro'yxatlar)", "Set", "Tuple", "List metodlari"],
    },
    {
        id: 30,
        name: "30-dars: Class va Object",
        topics: ["OOP asoslari", "Klass yaratish", "Konstruktor __init__"],
    },
    {
        id: 31,
        name: "31-dars: Tkinter Kutubxonasi",
        topics: [
            "GUI dasturlar yaratish",
            "Oyna",
            "Button",
            "Label elementlari",
        ],
    },
    {
        id: 32,
        name: "32-dars: Malumotlar bilan ishlash",
        topics: ["Fayllar bilan ishlash", "open", "read", "write metodlari"],
    },
    {
        id: 33,
        name: "33-dars: Bot yaratish. Mening birinchi botim",
        topics: ["BotFather", "Aiogram/Telebot kutubxonasi asoslari"],
    },
    {
        id: 34,
        name: "34-dars: Ovozli bot yaratish",
        topics: ["Telegramda audio signallar", "Voice message bilan ishlash"],
    },
    {
        id: 35,
        name: "35-dars: It live bot",
        topics: ["Real-time loyihalar", "Bot arxitekturasi"],
    },
    {
        id: 36,
        name: "36-dars: Telegram bot Guliston burger uz",
        topics: ["Kafedagi buyurtmalar uchun amaliy bot loyihasi"],
    },
    {
        id: 37,
        name: "37-dars: SQL . CRUD",
        topics: [
            "Ma'lumotlar bazasi",
            "SQLite/PostgreSQL",
            "Select, Insert, Update, Delete",
        ],
    },
];

export const getLessonById = (lessonId: number): Lesson | undefined =>
    FoundationSyllabus.find((lesson) => lesson.id === lessonId);

export const getLessonsUpTo = (lessonId: number): Lesson[] =>
    FoundationSyllabus.filter(
        (lesson) => lesson.id >= 1 && lesson.id <= lessonId,
    );

export const getTopicsUpToLesson = (lessonId: number): string[] =>
    getLessonsUpTo(lessonId).flatMap((lesson) => lesson.topics);

export const getCategoryForLesson = (
    lessonId: number,
): SubjectCategory | undefined =>
    SubjectCategories.find(
        (category) =>
            lessonId >= category.fromLesson && lessonId <= category.toLesson,
    );

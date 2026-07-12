export interface Lesson {
    id: number;
    name: string;
    topics: string[];
    keyKnowledge: string; // AI savol tuzish uchun haqiqiy kontent
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
        keyKnowledge: `IT sohasida asosiy yo'nalishlar: dasturchi (backend, frontend, fullstack), dizayner (UI/UX), tester (QA), DevOps, data scientist. 
        Dasturchi bo'lish uchun kerak bo'lgan ko'nikmalar: mantiqiy fikrlash, muammo hal qilish, matematika. 
        Kurs davomida o'rganiladigan texnologiyalar: MS Office, C++, Python, Telegram bot, SQL.
        IT sohasidagi asosiy atamalar: kod, algoritm, dastur, compiler, interpreter.`,
    },
    {
        id: 2,
        name: "2-dars: IT kompaniyalar haqida",
        topics: ["Global va mahalliy IT bozor", "Kompaniyalar iyerarxiyasi"],
        keyKnowledge: `Dunyoning eng yirik IT kompaniyalari: Google, Microsoft, Apple, Amazon, Meta (Facebook). 
        O'zbekistondagi IT kompaniyalar: Uzum, Click, Payme, Humans.uz, Ucell. 
        IT kompaniyada lavozimlar: Junior, Middle, Senior dasturchi. 
        Kompaniya tuzilmasi: CEO, CTO, Product Manager, Developer, Designer, Tester.
        Freelancing va remote ish tushunchasi. Soatlik stavka va loyiha asosida ish.
        IT mahsulot turlari: mobil ilova, web sayt, desktop dastur, SaaS.`,
    },
    {
        id: 3,
        name: "3-dars: Operatsion Sistema & Typing",
        topics: ["Windows/Linux/MacOS asoslari", "Klaviatura simulyatorlari", "Tez yozish qoidalari"],
        keyKnowledge: `Operatsion sistemalar: Windows (Microsoft), macOS (Apple), Linux (ochiq manba). 
        Windows-da asosiy papkalar: Desktop, Documents, Downloads, Program Files. 
        Fayl kengaytmalari: .exe (dastur), .docx (Word), .xlsx (Excel), .pdf, .jpg, .mp4.
        Keyboard shortcut'lar: Ctrl+C (nusxa), Ctrl+V (joylashtirish), Ctrl+Z (bekor qilish), Ctrl+S (saqlash), Alt+Tab (dasturlar orasida o'tish).
        10-barmoq terish usuli: F va J tugmalar bosh nuqtasi. Tez yozish uchun Typing.com, Keybr.com platformalari.
        Task Manager (Ctrl+Shift+Esc) — ishlaydigan dasturlarni ko'rish.`,
    },
    {
        id: 4,
        name: "4-dars: Office dasturlari",
        topics: ["Word", "Excel", "PowerPoint asoslari"],
        keyKnowledge: `Microsoft Word: hujjat yaratish, shrift o'zgartirish, paragraf formatlash, jadval qo'shish. 
        Saqlash: Ctrl+S, Boshqa nom bilan saqlash: F12. Sahifa o'lchamini o'zgartirish: Layout > Size.
        Microsoft Excel: kataklar (cells), ustunlar (A, B, C...), qatorlar (1, 2, 3...). 
        Formulalar: =SUM(A1:A10) yig'indi, =AVERAGE() o'rtacha, =MAX() maksimal, =MIN() minimal, =COUNT() sonlash.
        AutoFill (avtomatik to'ldirish), filter va sort qo'llash.
        PowerPoint: Slayd qo'shish (Ctrl+M), slaydlar o'rtasida o'tish animatsiyasi (Transitions), ob'ektlarga animatsiya (Animations).
        Taqdimotni boshqarish: F5 (to'liq ekran), Esc (to'xtatish).`,
    },
    {
        id: 5,
        name: "5-dars: Internet & Sun'iy intelekt",
        topics: ["Internet qanday ishlaydi", "AI vositalari", "Prompt engineering"],
        keyKnowledge: `Internet qanday ishlaydi: DNS (domain name system) domen nomini IP manzilga o'giradi. 
        HTTP va HTTPS protokollari: S — xavfsiz (SSL/TLS shifrlash). 
        Brauzerlar: Chrome, Firefox, Safari, Edge. Kesh (cache) va cookie tushunchasi.
        AI vositalari: ChatGPT (matn), Midjourney (rasm), GitHub Copilot (kod), Gemini (Google AI).
        Prompt engineering: AI dan yaxshi javob olish uchun aniq, batafsil so'rov yozish. 
        Yaxshi prompt qoidalari: rol bering ("Sen ekspert..."), kontekst bering, aniq natija so'rang.
        AI cheklovlari: noto'g'ri ma'lumot berishi mumkin (hallucination), real vaqt ma'lumoti yo'q.`,
    },
    {
        id: 6,
        name: "6-dars: Canva dasturi",
        topics: ["Grafik dizayn elementlari", "Canva vositalari bilan ishlash"],
        keyKnowledge: `Canva — onlayn grafik dizayn platformasi. Bepul va premium versiyalari mavjud.
        Canva da qilish mumkin: poster, taqdimot, banner, vizitka, sertifikat, logo, ijtimoiy tarmoq postlari.
        Asosiy elementlar: Text (matn), Elements (shakllar, ikonkalar), Background (fon), Image (rasm), Uploads (o'z rasmingiz).
        Shrift (font) tanlash va o'lcham o'zgartirish. Rang palitrasidan rang tanlash (HEX kod).
        Layer (qatlam) tushunchasi: ob'ektlarni old va orqa qatlam o'zgartirish.
        Eksport: PNG, JPG, PDF formatlarida yuklab olish. Share (ulashish) va prezentatsiya rejimi.`,
    },
    {
        id: 7,
        name: "7-dars: Animatsiya, video va yakuniy taqdimot",
        topics: ["Video montaj asoslari", "Pitch deck va taqdimot tayyorlash"],
        keyKnowledge: `Video montaj asoslari: kliplarni qirqish (trim), birlashtirish (merge), effekt qo'shish.
        Capcut yoki iMovie asosiy vositalar: timeline (vaqt chizig'i), audio track, subtitle (sarlavha).
        Video formatlar: MP4 (eng keng tarqalgan), MOV (Apple), AVI, MKV.
        FPS (frames per second): 24fps — kino, 30fps — standart, 60fps — sport.
        Pitch deck — investorlar uchun taqdimot: muammo, yechim, bozor, moliya, jamoa.
        Samarali taqdimot qoidalari: 10/20/30 qoidasi (10 slayd, 20 daqiqa, 30pt shrift).
        Taqdimot tuzilmasi: kirish, asosiy qism, xulosa, savol-javob.`,
    },
    {
        id: 8,
        name: "8-dars: Axborot & Sanoq tizimlari",
        topics: ["Axborot turlari", "Sanoq tizimlari tushunchasi"],
        keyKnowledge: `Axborot — atrof-muhit haqida ma'lumot. Axborot turlari: matn, son, rasm, ovoz, video.
        Kompyuter ma'lumotni bit va bayt shaklida saqlaydi. 1 bayt = 8 bit.
        Ma'lumot o'lchov birliklari: 1 KB = 1024 bayt, 1 MB = 1024 KB, 1 GB = 1024 MB, 1 TB = 1024 GB.
        Sanoq tizimlari: O'nlik (0-9 raqamlar), Ikkilik (0 va 1), O'n oltilik (0-9 va A-F).
        Kompyuter faqat ikkilik (binary) tizimda ishlaydi — 0 (tok yo'q) va 1 (tok bor).
        ASCII kod: har bir belgi (harf, raqam, belgi) uchun son qiymati. 'A' = 65, 'a' = 97, '0' = 48.`,
    },
    {
        id: 9,
        name: "9-dars: Sanoq tizimlar",
        topics: ["Ikkilik", "O'nlik", "O'n oltilik sanoq tizimlari", "Biridan ikkinchisiga o'tkazish"],
        keyKnowledge: `O'nlik → Ikkilikka o'tkazish: sonni 2 ga bo'lib, qoldiqlarni yozish. 
        Masalan: 13 → 1101 (13÷2=6 qoldiq 1, 6÷2=3 qoldiq 0, 3÷2=1 qoldiq 1, 1÷2=0 qoldiq 1).
        Ikkilikdan O'nlikka: har bir bit o'rniga 2 ning darajasini ko'paytirish.
        Masalan: 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10.
        O'n oltilik (HEX): 0-9 va A(10), B(11), C(12), D(13), E(14), F(15).
        HEX → O'nlik: FF = 15×16 + 15 = 255. 
        HEX ranglari: #FF0000 (qizil), #00FF00 (yashil), #0000FF (ko'k), #FFFFFF (oq), #000000 (qora).
        4 bit = 1 HEX raqami. 8 bit (1 bayt) = 2 HEX raqami.`,
    },
    {
        id: 10,
        name: "10-dars: Algoritm & Blok sxemalar",
        topics: ["Algoritm qoidalari", "Blok sxema elementlari"],
        keyKnowledge: `Algoritm — muammoni hal qilishning qadamba-qadam rejasi. 
        Algoritm xususiyatlari: aniqlik (determinizm), cheklilik (finite), natija berish (output), kirish ma'lumoti (input).
        Blok sxema elementlari: 
        - Oval/Ellips: Boshlanish va tugash (Start/End)
        - To'g'ri to'rtburchak: Amal/hisoblash (Process)  
        - Parallelogram: Kiritish/chiqarish (Input/Output)
        - Romb: Shart tekshirish (Decision) — ha/yo'q chiqishi
        - O'q: Yo'nalish (Arrow/Flow)
        Blok sxema yozish qoidalari: chapdan o'ngga yoki yuqoridan pastga. Har bir blok bir amalni bajaradi.`,
    },
    {
        id: 11,
        name: "11-dars: Chiziqli algoritm, Tarmoqlanuvchi, Takrorlanuvchi algoritm",
        topics: ["Algoritm turlari va mantiqiy tuzilmalar"],
        keyKnowledge: `Chiziqli algoritm: amallar ketma-ket bajariladi, tarmoqlanish yo'q. 
        Masalan: sonni kiritish → ikkilantirish → chiqarish.
        Tarmoqlanuvchi algoritm: shartga qarab turli yo'llar tanlanadi (if-else). 
        Masalan: son musbatmi? — ha: "musbat" chiqar, yo'q: "manfiy" chiqar.
        Takrorlanuvchi (sikl) algoritm: bir amal bir necha marta bajariladi (loop/tsikl).
        Tsikl turlari: sanagich bilan (for), shart bo'yicha (while).
        Masalan: 1 dan 10 gacha sonlarni chiqarish — for tsikl ishlatiladi.
        Ichma-ich tsikl: bir tsikl ichida boshqa tsikl. Ko'paytirish jadvalini chiqarishda ishlatiladi.`,
    },
    {
        id: 12,
        name: "12-dars: C++ dasturlash tiliga kirish",
        topics: ["C++ sintaksisi", "cout va cin operatorlari", "Ilk dastur"],
        keyKnowledge: `C++ dasturning asosiy tuzilmasi:
        #include <iostream>
        using namespace std;
        int main() {
            cout << "Salom Dunyo!" << endl;
            return 0;
        }
        #include <iostream> — kirish/chiqarish uchun kutubxona.
        cout << — ekranga chiqarish operatori. cin >> — klaviaturadan o'qish operatori.
        endl yoki \\n — yangi qatorga o'tish.
        main() — dastur boshlanadigan asosiy funksiya. return 0 — dastur muvaffaqiyatli tugadi.
        Kompilatsiya: g++ -o dastur dastur.cpp
        Izoh (comment): // bir qatorli, /* */ ko'p qatorli.`,
    },
    {
        id: 13,
        name: "13-dars: Ma'lumot turlari – Data types",
        topics: ["int", "float", "double", "char", "bool", "C++ o'zgaruvchilari"],
        keyKnowledge: `C++ ma'lumot turlari:
        int — butun son (-2147483648 dan +2147483647). Misol: int yosh = 20;
        float — haqiqiy son, 6-7 xonali aniqlik. Misol: float bahosi = 3.14f;
        double — haqiqiy son, 15-16 xonali aniqlik (floatdan aniqroq). Misol: double pi = 3.14159265;
        char — bitta belgi, qo'shtirnoqda. Misol: char harf = 'A';
        bool — mantiqiy qiymat: true (1) yoki false (0). Misol: bool faol = true;
        string — matn (so'z). #include <string> kerak. Misol: string ism = "Ali";
        O'zgaruvchi e'lon qilish: [tur] [nom] = [qiymat]; 
        const — o'zgarmas qiymat: const int MAX = 100;`,
    },
    {
        id: 14,
        name: "14-dars: Tarmoqlanuvchi operatorlar",
        topics: ["if", "else if", "else", "switch case operatorlari"],
        keyKnowledge: `if-else sintaksisi C++:
        if (shart) { ... } else if (shart2) { ... } else { ... }
        Taqqoslash operatorlari: == (teng), != (teng emas), > (katta), < (kichik), >= (katta-teng), <= (kichik-teng).
        Mantiqiy operatorlar: && (va/AND), || (yoki/OR), ! (emas/NOT).
        switch-case: bir o'zgaruvchining qiymatiga qarab turli amallar:
        switch(x) { case 1: ...; break; case 2: ...; break; default: ...; }
        break — keyingi case ga o'tishni to'xtatadi. default — hech bir case mos kelmasa.
        Ternary operator: (shart) ? rost_qiymat : yolg'on_qiymat`,
    },
    {
        id: 15,
        name: "15-dars: Sikl operatorlari (Loop)",
        topics: ["for", "while", "do while tsikllari"],
        keyKnowledge: `for tsikli sintaksisi: for (boshlang'ich; shart; o'zgartirish) { ... }
        Masalan: for (int i = 0; i < 10; i++) { cout << i; } — 0 dan 9 gacha chiqaradi.
        while tsikli: while (shart) { ... } — shart rost bo'lsa davom etadi.
        do-while: do { ... } while (shart); — kamida bir marta bajariladi.
        break — tsikldan chiqish. continue — joriy iteratsiyani o'tkazib yuborish.
        Cheksiz tsikl: while(true) { } — break bilan to'xtatiladi.
        Ichma-ich tsikl: for ichida for. Ko'paytirish jadvali uchun 2 ta for tsikl.
        i++ (postfix) va ++i (prefix) farqi: ikkalasi ham i ni 1 ga oshiradi.`,
    },
    {
        id: 16,
        name: "16-dars: Sikl va shart operatori ishlatilish",
        topics: ["Murakkab masalalar", "Sikl ichida shart tekshirish"],
        keyKnowledge: `Juft va toq sonlarni ajratish: if (i % 2 == 0) — juft son. % (modul) qoldiq operatori.
        Faktorial hisoblash: n! = 1*2*3*...*n, for tsikl ishlatiladi.
        Fibonacci ketma-ketligi: 0, 1, 1, 2, 3, 5, 8... — har son oldingiki ikki sonning yig'indisi.
        Maksimal/minimal topish: tsikl va if bilan. Masalan: if (x > max) max = x;
        1 dan N gacha yig'indi: sum += i (yig'uvchi o'zgaruvchi).
        Tub son tekshirish: 2 dan sqrt(n) gacha bo'luvchi topilmasa tub son.
        break va continue foydalanish misollari: break — 1-topilganda chiqish.`,
    },
    {
        id: 17,
        name: "17-dars: Cmath va String kutubxonalari",
        topics: ["Matematik funksiyalar", "Satrlar bilan ishlash metodlari"],
        keyKnowledge: `#include <cmath> kutubxonasi funksiyalari:
        sqrt(x) — kvadrat ildiz, pow(x, n) — daraja (x^n), abs(x) — mutlaq qiymat,
        ceil(x) — yuqori yaxlitlash, floor(x) — quyi yaxlitlash, round(x) — yaxlitlash.
        #include <string> kutubxonasi metodlari:
        s.length() yoki s.size() — satr uzunligi.
        s.substr(boshlanish, uzunlik) — satrning bir qismi.
        s.find("qidiruv") — pozitsiyani topish (topilmasa string::npos qaytaradi).
        s.replace(boshlanish, uzunlik, "yangi") — almashtirish.
        s + t — satrlarni birlashtirish (concatenation).
        s[i] — i-indeksdagi belgini olish (0 dan boshlanadi).
        toupper() / tolower() — harfni katta/kichikga aylantirish.`,
    },
    {
        id: 18,
        name: "18-dars: Funksiya (Function) - 1",
        topics: ["Funksiya yaratish", "Parametrlar va return tushunchasi"],
        keyKnowledge: `Funksiya sintaksisi C++:
        [qaytarish_turi] [nom](parametrlar) { ... return qiymat; }
        Masalan: int yig'indi(int a, int b) { return a + b; }
        Funksiyani chaqirish: int natija = yig'indi(5, 3);
        return — funksiya natijasini qaytaradi va to'xtatadi.
        Parametrlar — funksiyaga kiruvchi ma'lumotlar (argument deb ham ataladi).
        Funksiyani main() dan OLDIN e'lon qilish shart (yoki prototip yozish).
        Prototip: int yig'indi(int, int); — oldindan bildirish.
        Bir nechta parametr turli tipda bo'lishi mumkin: void chop(string ism, int yosh)`,
    },
    {
        id: 19,
        name: "19-dars: Funksiya (Function) - 2",
        topics: ["Void funksiyalar", "Global va lokal o'zgaruvchilar"],
        keyKnowledge: `void funksiya — hech narsa qaytarmaydi, faqat amal bajaradi.
        Masalan: void salom() { cout << "Salom!"; } — return yo'q.
        Lokal o'zgaruvchi — faqat funksiya ichida mavjud, tashqarida ko'rinmaydi.
        Global o'zgaruvchi — dasturning barcha joyida ko'rinadi, funksiyadan tashqarida e'lon qilinadi.
        Default parametr: int oshir(int x, int n=1) { return x+n; } — n ko'rsatilmasa 1 bo'ladi.
        Overloading (haddan ortiq yuklash): bir xil nomli, turli parametrli funksiyalar.
        Masalan: int qo'sh(int,int) va double qo'sh(double,double) — ikkisi ham ishlaydi.
        Pass by value va pass by reference: 
        void f(int &x) { x++; } — original qiymatni o'zgartiradi.`,
    },
    {
        id: 20,
        name: "20-dars: Massiv",
        topics: ["Bir o'lchamli massivlar", "Massiv elementlarini indekslash"],
        keyKnowledge: `Massiv (array) — bir xil turdagi elementlar to'plami.
        E'lon qilish: int sonlar[5] = {10, 20, 30, 40, 50};
        Elementlarga murojaat: sonlar[0] = 10 (birinchi element), sonlar[4] = 50 (oxirgi).
        Indeks 0 dan boshlanadi! 5 ta elementli massivda indeks 0-4 bo'ladi.
        Massivni to'ldirish: for (int i=0; i<5; i++) cin >> arr[i];
        Massivni chiqarish: for (int i=0; i<5; i++) cout << arr[i];
        Massivni saralash (sort): #include <algorithm> kutubxonasi, sort(arr, arr+n).
        Ikki o'lchamli massiv (2D): int jadval[3][3]; — satir va ustunlar.
        sizeof(arr)/sizeof(arr[0]) — massiv uzunligini topish.`,
    },
    {
        id: 21,
        name: "21-dars: Massiv va Funksiya. Tizim 1",
        topics: ["Massivlarni funksiyaga uzatish", "Algoritmik masalalar"],
        keyKnowledge: `Massivni funksiyaga uzatish: void chop(int arr[], int n) { ... }
        Massiv funksiyaga reference sifatida uzatiladi (nusxa emas), shuning uchun o'zgartirsangiz original o'zgaradi.
        Maksimal element topish: int max = arr[0]; for ichida if (arr[i] > max) max = arr[i];
        Minimal element topish: shu usulda, lekin < operatori bilan.
        Elementlar yig'indisi: int sum = 0; for (int i=0; i<n; i++) sum += arr[i];
        O'rtacha qiymat: (double)sum / n;
        Massivni teskari tartibga o'girish: swap funksiyasi bilan bosh va oxiridan.
        Linear qidiruv (linear search): for ichida if (arr[i] == qidiruv) topildi.`,
    },
    {
        id: 22,
        name: "22-dars: Tizim 2 va Vector kutubxonasi",
        topics: ["Dinamik massivlar", "Vector metodlari (push_back, pop_back)"],
        keyKnowledge: `Vector — dinamik o'lchamli massiv. #include <vector> kutubxonasi.
        E'lon qilish: vector<int> v; yoki vector<int> v = {1, 2, 3};
        push_back(x) — oxirga element qo'shish. pop_back() — oxirgi elementni o'chirish.
        v.size() — elementlar soni. v[i] — i-elementga murojaat.
        v.empty() — bo'm-bo'sh bo'lsa true. v.clear() — barcha elementlarni o'chirish.
        v.front() — birinchi element. v.back() — oxirgi element.
        v.insert(v.begin()+i, x) — i-o'ringa qo'shish.
        v.erase(v.begin()+i) — i-elementni o'chirish.
        sort(v.begin(), v.end()) — saralash.
        Massiv vs Vector: massiv o'lcham belgilangan, vector dinamik o'zgaradi.`,
    },
    {
        id: 23,
        name: "23-dars: Python dasturlash tiliga kirish",
        topics: ["Python o'rnatish", "print va input", "Sintaksis farqlari"],
        keyKnowledge: `Python dasturning asosiy elementlari:
        print("Salom Dunyo!") — ekranga chiqarish.
        input("Ismingiz: ") — foydalanuvchidan ma'lumot olish (doim string qaytaradi).
        int(input()) yoki float(input()) — sonni kiriting.
        C++ dan farqlari: Python da { } yo'q, o'rniga indentatsiya (4 ta bo'sh joy). Nuqtali vergul (;) shart emas.
        Python - interpretatsiya tili (kompilyatsiya shart emas). 
        Python o'rnatish: python.org dan yuklab, PATH ga qo'shish. 
        IDE lar: VS Code, PyCharm, IDLE.
        O'zgaruvchi e'lon: tur ko'rsatmay yoziladi: ism = "Ali", yosh = 20.
        Python kuchli tomonlari: o'rganish oson, sun'iy intellekt, data science, veb.`,
    },
    {
        id: 24,
        name: "24-dars: Ma'lumot turlari – Data types",
        topics: ["int", "float", "str", "bool dynamic typing in Python"],
        keyKnowledge: `Python ma'lumot turlari:
        int — butun son: x = 10. float — haqiqiy son: y = 3.14. 
        str — matn: s = "Salom". bool — True yoki False (katta harf bilan!).
        type(x) — o'zgaruvchi turini bilish. Masalan: type(3.14) → <class 'float'>
        Dynamic typing — Python o'zi turni aniqlaydi, o'zgaruvchi turi o'zgarishi mumkin.
        Konvertatsiya: int("10") → 10, float("3.14") → 3.14, str(25) → "25", bool(0) → False.
        f-string: f"Salom, {ism}!" — o'zgaruvchini matnga qo'shish.
        String operatsiyalari: "Salom" + " Dunyo" = "Salom Dunyo" (concatenation).
        "Ha" * 3 = "HaHaHa". len("Salom") = 5. s.upper() s.lower() s.strip().`,
    },
    {
        id: 25,
        name: "25-dars: Shart va Shartli operatorlar",
        topics: ["if", "elif", "else mantiqiy operatorlar and/or/not"],
        keyKnowledge: `Python da if-elif-else (C++ da else if o'rniga elif):
        if shart:
            ...
        elif shart2:
            ...
        else:
            ...
        Muhim: Python da indentatsiya (4 bo'sh joy) shart, { } yo'q!
        Mantiqiy operatorlar Python: and (&&), or (||), not (!) — inglizcha so'z sifatida.
        Masalan: if x > 0 and x < 10: — x 1 dan 9 gacha.
        Taqqoslash: ==, !=, >, <, >=, <= — C++ bilan bir xil.
        in operatori: if "a" in "salom": — "a" harfi "salom" da bormi.
        Ternary (bir qatorli): natija = "musbat" if x > 0 else "manfiy"`,
    },
    {
        id: 26,
        name: "26-dars: Sikl operatorlari (Loop)",
        topics: ["for in", "while", "range funksiyasi"],
        keyKnowledge: `Python da for tsikl — iteratsiya uchun:
        for i in range(10): — 0 dan 9 gacha.
        range(bosh, oxir, qadam): range(1, 11) — 1 dan 10 gacha. range(0, 10, 2) — juft sonlar.
        for x in ro'yxat: — ro'yxat elementlari bo'yicha.
        while tsikl: while shart: — shart rost bo'lsa davom etadi.
        break — tsikldan chiqish. continue — keyingi iteratsiyaga o'tish. 
        pass — hech narsa qilmaslik (placeholder).
        enumerate(list) — indeks va qiymatni birga olish: for i, v in enumerate(lst).
        Ichma-ich tsikl: for ichida for — jadval chiqarish uchun.
        Python da C++ dagi i++ yo'q, o'rniga i += 1.`,
    },
    {
        id: 27,
        name: "27-dars: Funksiya (Function)",
        topics: ["def kalit so'zi", "Python funksiyalari"],
        keyKnowledge: `Python da funksiya yaratish:
        def funksiya_nomi(parametrlar):
            ...
            return qiymat
        def kalit so'zi — funksiya e'lon qilish. return — qiymat qaytarish.
        Chaqirish: natija = funksiya_nomi(argument)
        Default parametr: def salom(ism="Mehmon"): — ism ko'rsatilmasa "Mehmon" bo'ladi.
        *args — noma'lum miqdorda positional argument: def f(*args): args tuple sifatida.
        **kwargs — noma'lum miqdorda keyword argument: def f(**kwargs): kwargs dict sifatida.
        Lambda (anonim funksiya): f = lambda x: x*2 — qisqa, bir qatorli funksiya.
        Rekursiya: funksiya o'zini chaqiradi. Masalan: factorial(n) = n * factorial(n-1).`,
    },
    {
        id: 28,
        name: "28-dars: Pythonda tayyor funksiyalar",
        topics: ["len", "max", "min", "sum", "abs va boshqa built-in metodlar"],
        keyKnowledge: `Python built-in funksiyalar (import shart emas):
        len([1,2,3]) → 3 — uzunlik. max(1, 5, 3) → 5 — maksimal. min([2,1,4]) → 1 — minimal.
        sum([1,2,3]) → 6 — yig'indi. abs(-5) → 5 — mutlaq qiymat.
        round(3.7) → 4 — yaxlitlash. round(3.14159, 2) → 3.14.
        sorted([3,1,2]) → [1,2,3] — saralash (yangi list). list.sort() — o'rnida saralash.
        reversed([1,2,3]) — teskari tartib (iterator qaytaradi).
        range(5) → 0,1,2,3,4. list(range(5)) → [0,1,2,3,4].
        zip(list1, list2) — ikki listni birlashtirish: [(a1,b1), (a2,b2)...].
        map(funksiya, list) — har elementga funksiya qo'llash.
        filter(funksiya, list) — shartga mos elementlarni olish.`,
    },
    {
        id: 29,
        name: "29-dars: Toplamlar va Listlar",
        topics: ["List (ro'yxatlar)", "Set", "Tuple", "List metodlari"],
        keyKnowledge: `List — o'zgaruvchan (mutable) tartibli to'plam: lst = [1, 2, 3].
        lst.append(x) — oxirga qo'shish. lst.insert(i, x) — i-o'ringa qo'shish.
        lst.remove(x) — qiymatni o'chirish. lst.pop(i) — i-elementni o'chirib qaytarish.
        lst.index(x) — qiymatning indeksi. lst.count(x) — qancha marta uchrashi.
        Slicing: lst[1:4] — 1 dan 3 gacha elementlar. lst[::-1] — teskari.
        Tuple — o'zgarmas (immutable) tartibli to'plam: t = (1, 2, 3). t[0] — murojaat.
        Set — takrorlanmas elementlar, tartiby'oq: s = {1, 2, 3}. s.add(x), s.remove(x).
        Set amallar: s1 & s2 (kesishma), s1 | s2 (birlashma), s1 - s2 (farq).
        Dictionary: d = {"kalit": "qiymat"}. d["kalit"] — qiymat olish. d.keys(), d.values(), d.items().`,
    },
    {
        id: 30,
        name: "30-dars: Class va Object",
        topics: ["OOP asoslari", "Klass yaratish", "Konstruktor __init__"],
        keyKnowledge: `OOP (Object Oriented Programming) — ob'ektga yo'naltirilgan dasturlash.
        Class — ob'ekt uchun qolip (shablon). Object — klassdan yaratilgan nusxa.
        Klass yaratish:
        class Talaba:
            def __init__(self, ism, yosh):
                self.ism = ism
                self.yosh = yosh
            def tanishtir(self):
                print(f"Men {self.ism}, {self.yosh} yoshdaman")
        __init__ — konstruktor, ob'ekt yaratilganda chaqiriladi.
        self — ob'ektning o'zi. self.ism — ob'ekt atributi.
        Ob'ekt yaratish: t = Talaba("Ali", 20). Metod chaqirish: t.tanishtir().
        Meros (Inheritance): class Doktor(Talaba): — Talaba klassidan meros oladi.
        Encapsulation: __ism — xususiy atribut (tashqaridan to'g'ridan to'g'ri o'zgartirib bo'lmaydi).`,
    },
    {
        id: 31,
        name: "31-dars: Tkinter Kutubxonasi",
        topics: ["GUI dasturlar yaratish", "Oyna", "Button", "Label elementlari"],
        keyKnowledge: `Tkinter — Python da GUI (grafik interfeys) yaratish kutubxonasi. Import: import tkinter as tk.
        Asosiy oyna: root = tk.Tk(). root.title("Sarlavha"). root.geometry("400x300"). root.mainloop().
        Vidjetlar (widgets):
        tk.Label(root, text="Matn") — matn ko'rsatish.
        tk.Button(root, text="Bosing", command=funksiya) — tugma.
        tk.Entry(root) — bitta qator matn kiritish. entry.get() — kiritilgan matnni olish.
        tk.Text(root) — ko'p qatorli matn. 
        Pack joylash: widget.pack() — elementni joylashtirish. pack(side="left"/"right"/"top"/"bottom").
        Grid joylash: widget.grid(row=0, column=1) — jadval ko'rinishida.
        messagebox.showinfo("Sarlavha", "Xabar") — dialog oyna.`,
    },
    {
        id: 32,
        name: "32-dars: Malumotlar bilan ishlash",
        topics: ["Fayllar bilan ishlash", "open", "read", "write metodlari"],
        keyKnowledge: `Python da fayl bilan ishlash:
        open(fayl_nomi, rejim) — faylni ochish.
        Rejimlar: 'r' — o'qish (read), 'w' — yozish (write, mavjud bo'lsa ustiga yozadi), 
        'a' — oxirga qo'shish (append), 'x' — yangi fayl yaratish.
        f = open("fayl.txt", "r"). f.read() — hammasini o'qish. f.readline() — bir qatorni.
        f.readlines() — barcha qatorlarni list sifatida.
        Yozish: f.write("Matn\\n"). f.close() — faylni yopish.
        with open("fayl.txt", "r") as f: — avtomatik yopadi (tavsiya etilgan usul).
        f.read() va f.readlines() farqi: read() — string, readlines() — list.
        CSV fayllar: import csv. csv.reader() va csv.writer() bilan ishlash.
        JSON: import json. json.loads() — json stringni dict ga. json.dumps() — dict ni json ga.`,
    },
    {
        id: 33,
        name: "33-dars: Bot yaratish. Mening birinchi botim",
        topics: ["BotFather", "Aiogram/Telebot kutubxonasi asoslari"],
        keyKnowledge: `Telegram bot yaratish bosqichlari:
        1. @BotFather ga /newbot buyrug'i yuborish. 2. Bot nomi va username kiritish. 3. Token olish.
        Token — botning maxfiy kaliti. Hech kimga bermaslik.
        Telebot (pyTelegramBotAPI) kutubxonasi:
        import telebot. bot = telebot.TeleBot("TOKEN").
        @bot.message_handler(commands=["start"]) — /start buyrug'ini ushlash.
        bot.send_message(chat_id, "Matn") — xabar yuborish.
        bot.polling() — botni ishga tushirish (xabarlarni tinglash).
        message.chat.id — foydalanuvchi ID si. message.text — yuborilgan matn.
        Klaviatura tugmalari: types.ReplyKeyboardMarkup() — pastdagi tugmalar.
        InlineKeyboard: types.InlineKeyboardMarkup() — xabar ichidagi tugmalar.`,
    },
    {
        id: 34,
        name: "34-dars: Ovozli bot yaratish",
        topics: ["Telegramda audio signallar", "Voice message bilan ishlash"],
        keyKnowledge: `Telegramda ovozli xabarlar bilan ishlash:
        @bot.message_handler(content_types=["voice"]) — ovozli xabarni ushlash.
        message.voice.file_id — ovozli faylning ID si.
        bot.download_file() — faylni serverdan yuklab olish.
        SpeechRecognition kutubxonasi: ovozni matnga o'girish (speech-to-text).
        pydub kutubxonasi: audio formatlarini o'zgartirish (ogg → wav).
        bot.send_voice(chat_id, audio) — ovozli xabar yuborish.
        bot.send_audio(chat_id, audio) — musiqa fayl yuborish.
        Fayl turlari: voice (ogg), audio (mp3), document (har qanday fayl).
        Webhook vs Polling: polling — bot so'rOb turadi, webhook — server xabar kelganda chaqiradi.`,
    },
    {
        id: 35,
        name: "35-dars: It live bot",
        topics: ["Real-time loyihalar", "Bot arxitekturasi"],
        keyKnowledge: `Real-time bot arxitekturasi:
        State (holat) boshqaruvi — foydalanuvchi qaysi bosqichda ekanini saqlash. 
        User state dictionary: user_states = {} — har foydalanuvchi uchun holat.
        Conversation flow: /start → ism so'rash → yosh so'rash → tasdiqlash.
        Inline keyboard callback: @bot.callback_query_handler(func=lambda c: True).
        call.data — tugma bosilganda kelgan ma'lumot. bot.answer_callback_query(call.id).
        bot.edit_message_text() — mavjud xabarni o'zgartirish.
        bot.delete_message() — xabarni o'chirish.
        Rate limiting — spam'ni oldini olish. Middleware va decorator pattern.
        Logging: import logging — xatolarni kuzatish. Bot deployment: VPS, Heroku, Railway.`,
    },
    {
        id: 36,
        name: "36-dars: Telegram bot Guliston burger uz",
        topics: ["Kafedagi buyurtmalar uchun amaliy bot loyihasi"],
        keyKnowledge: `Buyurtma bot loyihasi tuzilmasi:
        Menu tizimi — kategoriyalar (burger, pizza, ichimliklar), mahsulotlar va narxlar.
        Savat (cart) tizimi — foydalanuvchi savati: user_carts = {chat_id: [mahsulotlar]}.
        Buyurtma bosqichlari: menu ko'rish → tanlash → savat → manzil → to'lash → tasdiqlash.
        Admin panel — yangi buyurtmalarni ko'rish, tasdiqlash yoki rad etish.
        Bazaga saqlash — SQLite yoki JSON faylda buyurtmalarni saqlash.
        Yetkazib berish manzili — location (GPS koordinat) yoki matn sifatida.
        To'lov usullari: naqd, karta, Payme/Click integratsiyasi (link orqali).
        Buyurtma raqami va status: "Qabul qilindi", "Tayyorlanmoqda", "Yo'lda", "Yetkazildi".`,
    },
    {
        id: 37,
        name: "37-dars: SQL . CRUD",
        topics: ["Ma'lumotlar bazasi", "SQLite/PostgreSQL", "Select, Insert, Update, Delete"],
        keyKnowledge: `SQL — Structured Query Language — ma'lumotlar bazasini boshqarish tili.
        CRUD: Create (yaratish), Read (o'qish), Update (yangilash), Delete (o'chirish).
        SELECT: SELECT * FROM talabalar; — barcha ustunlar. SELECT ism, yosh FROM talabalar WHERE yosh > 18;
        INSERT: INSERT INTO talabalar (ism, yosh) VALUES ('Ali', 20);
        UPDATE: UPDATE talabalar SET yosh = 21 WHERE ism = 'Ali';
        DELETE: DELETE FROM talabalar WHERE id = 5;
        Jadval yaratish: CREATE TABLE talabalar (id INTEGER PRIMARY KEY, ism TEXT, yosh INTEGER);
        WHERE shart: AND, OR, NOT, LIKE ('%ali%' — qismi mos kelsa), BETWEEN, IN.
        ORDER BY: SELECT * FROM t ORDER BY yosh DESC; — kamayish tartibida.
        LIMIT: SELECT * FROM t LIMIT 10; — faqat 10 ta yozuv.
        JOIN: ikki jadvaldan ma'lumot olish. COUNT(*), SUM(), AVG(), MAX(), MIN() agregat funksiyalar.`,
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

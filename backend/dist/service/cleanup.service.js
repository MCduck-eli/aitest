"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupJob = void 0;
const database_1 = require("../config/database");
const startCleanupJob = () => {
    const runCleanup = async () => {
        try {
            console.log('🧹 [Cleanup Job] 24 soatdan oshgan imtihon natijalarini tozalash boshlandi...');
            const result = await (0, database_1.query)(`
                DELETE FROM exam_results 
                WHERE created_at < NOW() - INTERVAL '24 hours'
            `);
            if (result.rowCount && result.rowCount > 0) {
                console.log(`✅ [Cleanup Job] ${result.rowCount} ta eski imtihon natijasi bazadan tozalandi.`);
            }
            else {
                console.log('✅ [Cleanup Job] Tozalash uchun 24 soatdan oshgan natijalar topilmadi.');
            }
        }
        catch (error) {
            console.error('❌ [Cleanup Job] Tozalash jarayonida xatolik yuz berdi:', error);
        }
    };
    // Server yonganda darhol bir marta tozalaydi
    runCleanup();
    // Va har 1 soatda qayta ishlaydi
    setInterval(runCleanup, 60 * 60 * 1000);
};
exports.startCleanupJob = startCleanupJob;

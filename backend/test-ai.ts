import { checkProctoringImage } from './src/service/ai.service';
import fs from 'fs';

async function test() {
    console.log("Testing checkProctoringImage...");
    // A fake 1x1 jpeg base64, just to see what the API responds or if it fails
    const fakeImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    
    try {
        const result = await checkProctoringImage(fakeImage);
        console.log("RESULT:", result);
    } catch (e) {
        console.error("ERROR:", e);
    }
}

test();

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

const API_KEY = process.env.GEMINI_API_KEY;

console.log('🔍 Testing Gemini API...\n');
console.log('✓ API Key found:', API_KEY ? `${API_KEY.substring(0, 15)}...` : 'MISSING!');

if (!API_KEY) {
    console.error('❌ No API key in .env.local!');
    process.exit(1);
}

try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('✓ GoogleGenAI client created\n');

    console.log('Testing gemini-1.5-flash...');
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'Say "Hello from Gemini" if you can read this.'
    });

    console.log('✓ Response received:', response.text?.substring(0, 100) || 'No text');
    console.log('\n✅ SUCCESS! API is working!\n');

} catch (error) {
    console.error('\n❌ ERROR:\n');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.details);
    console.error('\nFull error:', error);

    if (error.message?.includes('429')) {
        console.error('\n⚠️  RATE LIMIT! Wait 30 minutes or get a new API key.');
    } else if (error.message?.includes('API_KEY_INVALID')) {
        console.error('\n⚠️  Invalid API key! Get a new one from https://aistudio.google.com/app/apikey');
    }

    process.exit(1);
}

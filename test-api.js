// Simple test to verify Gemini API works with your key
import { GoogleGenAI } from '@google/genai';

const API_KEY = 'AIzaSyAsuMB5Vf6jqmTF5_BRGNwUqSt_iwbrGq0'; // From your .env.local

console.log('🔍 Testing Gemini API...');
console.log(`✅ API Key loaded: ${API_KEY.substring(0, 10)}...`);

try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('✅ GoogleGenAI client created successfully');

    const testResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Say "Hello from Gemini!" if you can read this.'
    });

    console.log('✅ API Response received:');
    console.log(testResponse.text || 'No text response');
    console.log('\n🎉 SUCCESS! Your Gemini API key is working correctly!');

} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n📋 Full error:', error);

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('400')) {
        console.error('\n⚠️  Your API key appears to be invalid or disabled.');
        console.error('👉 Get a new one at: https://aistudio.google.com/app/apikey');
    } else if (error.message?.includes('quota')) {
        console.error('\n⚠️  API quota exceeded.');
        console.error('👉 Wait 24 hours or upgrade your quota.');
    } else if (error.message?.includes('model')) {
        console.error('\n⚠️  Model name might be wrong. Try "gemini-pro" instead.');
    }
}

process.exit(0);

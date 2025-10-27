/**
 * Automatic Translation Script
 * 
 * This script uses AI to automatically translate the base English translations
 * to other languages. It can use OpenAI GPT-4 or other translation services.
 * 
 * Usage:
 * 1. Set up your API key: export OPENAI_API_KEY="your-key-here"
 * 2. Run: npx ts-node scripts/translate.ts
 * 
 * Or manually translate specific language:
 * npx ts-node scripts/translate.ts --lang es
 */

import fs from 'fs';
import path from 'path';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

const LANGUAGES = {
  es: 'Spanish',
  fr: 'French',
  zh: 'Chinese (Simplified)',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  pt: 'Portuguese',
  ar: 'Arabic',
};

/**
 * Translate using OpenAI GPT-4
 * Requires: npm install openai
 */
async function translateWithOpenAI(
  content: TranslationObject,
  targetLang: string
): Promise<TranslationObject> {
  try {
    // Dynamic import to avoid errors if openai is not installed
    const { default: OpenAI } = await import('openai');
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const openai = new OpenAI({ apiKey });
    
    const langName = LANGUAGES[targetLang as keyof typeof LANGUAGES];
    
    console.log(`🤖 Translating to ${langName} using GPT-4...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following JSON from English to ${langName}. 
          IMPORTANT: 
          - Keep ALL keys in English - only translate the VALUES
          - Maintain the exact same JSON structure
          - Preserve any placeholders like {name}, {date}, etc.
          - Keep formatting and punctuation appropriate for ${langName}
          - Return ONLY valid JSON, no explanations`
        },
        {
          role: "user",
          content: JSON.stringify(content, null, 2)
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
    });
    
    const translatedText = response.choices[0].message.content;
    if (!translatedText) {
      throw new Error('No translation received from OpenAI');
    }
    
    // Parse the response, removing any markdown code blocks if present
    const cleanedText = translatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      console.error('❌ OpenAI package not installed. Run: npm install openai');
    } else {
      console.error('❌ Translation error:', error);
    }
    throw error;
  }
}

/**
 * Translate using Google Translate
 * Requires: npm install @google-cloud/translate
 */
async function translateWithGoogle(
  content: TranslationObject,
  targetLang: string
): Promise<TranslationObject> {
  console.log('📝 Google Translate integration - implement if needed');
  // Implementation here if you prefer Google Translate
  return content;
}

/**
 * Recursively translate all string values in an object
 */
function translateObject(
  obj: TranslationObject,
  translateFn: (text: string) => Promise<string>
): Promise<TranslationObject> {
  const result: TranslationObject = {};
  
  const promises = Object.entries(obj).map(async ([key, value]) => {
    if (typeof value === 'string') {
      result[key] = await translateFn(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, translateFn);
    } else {
      result[key] = value;
    }
  });
  
  return Promise.all(promises).then(() => result);
}

/**
 * Main translation function
 */
async function translateFile(targetLang: string, method: 'openai' | 'google' = 'openai') {
  const messagesDir = path.join(process.cwd(), 'messages');
  const sourceFile = path.join(messagesDir, 'en.json');
  const targetFile = path.join(messagesDir, `${targetLang}.json`);
  
  // Read source file
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Source file not found: ${sourceFile}`);
    return;
  }
  
  const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  
  console.log(`\n📚 Translating English → ${LANGUAGES[targetLang as keyof typeof LANGUAGES]}`);
  console.log(`📄 Source: en.json`);
  console.log(`📄 Target: ${targetLang}.json`);
  
  try {
    let translated: TranslationObject;
    
    if (method === 'openai') {
      translated = await translateWithOpenAI(sourceContent, targetLang);
    } else {
      translated = await translateWithGoogle(sourceContent, targetLang);
    }
    
    // Write translated file
    fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2), 'utf8');
    
    console.log(`✅ Successfully translated to ${targetLang}.json`);
  } catch (error) {
    console.error(`❌ Failed to translate to ${targetLang}:`, error);
  }
}

/**
 * Translate all languages
 */
async function translateAll() {
  console.log('🌍 Starting batch translation for all languages...\n');
  
  for (const [langCode, langName] of Object.entries(LANGUAGES)) {
    try {
      await translateFile(langCode);
      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to translate ${langName}:`, error);
    }
  }
  
  console.log('\n✨ Batch translation complete!');
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const langArg = args.find(arg => arg.startsWith('--lang='));
  const targetLang = langArg ? langArg.split('=')[1] : null;
  
  console.log('🌐 Studious Translation Tool\n');
  
  if (targetLang) {
    if (!LANGUAGES[targetLang as keyof typeof LANGUAGES]) {
      console.error(`❌ Unsupported language: ${targetLang}`);
      console.log(`Supported languages: ${Object.keys(LANGUAGES).join(', ')}`);
      process.exit(1);
    }
    await translateFile(targetLang);
  } else {
    console.log('Translating to all supported languages...');
    // For now, just translate the ones we have placeholder files for
    await translateFile('es');
    await translateFile('fr');
    await translateFile('zh');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { translateFile, translateAll };


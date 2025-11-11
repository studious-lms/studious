/**
 * Automatic Translation Script with Google Translate
 * 
 * This script uses Google Translate API to automatically translate the base English translations
 * to other languages. Works with the new split translation file structure.
 * 
 * Usage:
 * 1. Set up your API key: export SERVICE_TRANSLATION_KEY="your-google-translate-api-key"
 * 2. Run: npx tsx scripts/translate.ts
 * 
 * Options:
 * --lang=<code>     Translate specific language (e.g., --lang=es)
 * --openai          Use OpenAI GPT-4 instead of Google Translate
 * --parallel-langs  Translate all languages in parallel (faster but uses more API quota)
 * --force           Force translate all keys, even if already translated
 * --force-all       Alias for --force
 * 
 * Examples:
 * npx tsx scripts/translate.ts --lang es
 * npx tsx scripts/translate.ts --force
 * npx tsx scripts/translate.ts --lang es --force
 * npx tsx scripts/translate.ts --openai --force
 * 
 * Install dependencies:
 * npm install @google-cloud/translate
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { LANGUAGES_TO_TRANSLATE, LANGUAGES } from '../src/lib/language';

dotenv.config();

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

/**
 * Get language name by code
 */
function getLanguageName(code: string): string {
  const language = LANGUAGES.find(lang => lang.code === code);
  return language?.name || code;
}

/**
 * Translate using OpenAI GPT-4
 * Requires: npm install openai
 */
async function translateWithOpenAI(
  content: TranslationObject,
  targetLang: string,
  fileName: string
): Promise<TranslationObject> {
  try {
    // Dynamic import to avoid errors if openai is not installed
    const { default: OpenAI } = await import('openai');
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY environment variable not set');
      return content;
    }

    const openai = new OpenAI({ apiKey });
    const languageName = getLanguageName(targetLang);

    console.log(`   🤖 Translating with OpenAI GPT-4 to ${languageName}...`);

    const prompt = `You are a professional translator. Translate the following JSON object from English to ${languageName}.

IMPORTANT RULES:
1. Preserve all JSON structure, keys, and formatting
2. Only translate the VALUES (text strings), never translate the KEYS
3. Preserve all placeholders like {variable}, {count}, etc.
4. Keep HTML tags intact if present
5. Maintain the same punctuation and formatting style
6. For technical terms, keep them in English if commonly used that way
7. Return ONLY the translated JSON, no explanations

Here's the JSON to translate:

${JSON.stringify(content, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. You translate JSON files while preserving structure and placeholders. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
    });

    const translatedText = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from markdown code blocks if present
    let jsonText = translatedText;
    const jsonMatch = translatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    
    const translated = JSON.parse(jsonText);
    return translated;

  } catch (error: any) {
    console.error(`   ❌ OpenAI translation failed for ${fileName}:`, error.message);
    return content; // Return original on error
  }
}

/**
 * Translate using Google Translate API with BATCHING for speed
 * Requires: npm install @google-cloud/translate
 */
async function translateWithGoogle(
  content: TranslationObject,
  targetLang: string
): Promise<TranslationObject> {
  try {
    const { Translate } = await import('@google-cloud/translate').then(m => m.v2);
    
    const apiKey = process.env.SERVICE_TRANSLATION_KEY;
    if (!apiKey) {
      console.error('❌ SERVICE_TRANSLATION_KEY environment variable not set');
      return content;
    }

    const translate = new Translate({ key: apiKey });

    // Step 1: Collect all strings to translate with their paths
    const stringsToTranslate: { path: string[]; value: string; placeholders: string[] }[] = [];
    
    function collectStrings(obj: any, currentPath: string[] = []) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          // Extract placeholders and store them in order
          const placeholders: string[] = [];
          let processedValue = value;
          
          // Find all placeholders like {variable}, {count}, etc.
          const placeholderRegex = /\{[^}]+\}/g;
          const matches = value.match(placeholderRegex);
          
          if (matches) {
            // Replace placeholders with numbered markers that are unlikely to be translated
            // Using a format that looks technical/code-like
            matches.forEach((placeholder, index) => {
              placeholders.push(placeholder);
              // Use a format that Google Translate API typically preserves
              const marker = `[[${index}]]`;
              processedValue = processedValue.replace(placeholder, marker);
            });
          }
          
          stringsToTranslate.push({ 
            path: [...currentPath, key], 
            value: processedValue,
            placeholders 
          });
        } else if (typeof value === 'object' && value !== null) {
          collectStrings(value, [...currentPath, key]);
        }
      }
    }
    
    collectStrings(content);

    if (stringsToTranslate.length === 0) {
      return content;
    }

    // Step 2: Batch translate ALL strings at once (much faster!)
    const textsToTranslate = stringsToTranslate.map(s => s.value);
    const BATCH_SIZE = 100; // Google Translate supports up to 128 strings per request
    const translations: string[] = [];

    for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
      const batch = textsToTranslate.slice(i, i + BATCH_SIZE);
      try {
        const [batchTranslations] = await translate.translate(batch, targetLang);
        translations.push(...(Array.isArray(batchTranslations) ? batchTranslations : [batchTranslations]));
      } catch (error) {
        console.error(`   ⚠️  Batch translation failed, using originals for batch ${i / BATCH_SIZE + 1}`);
        translations.push(...batch); // Fallback to originals
      }
    }

    // Step 3: Reconstruct the object with translations and restore placeholders
    const result = JSON.parse(JSON.stringify(content)); // Deep clone
    
    stringsToTranslate.forEach((item, index) => {
      let current: any = result;
      for (let i = 0; i < item.path.length - 1; i++) {
        current = current[item.path[i]];
      }
      
      // Restore placeholders in the translated text
      let translatedText = translations[index];
      
      // Replace the numbered markers back with original placeholders
      item.placeholders.forEach((placeholder, idx) => {
        const marker = `[[${idx}]]`;
        translatedText = translatedText.replace(marker, placeholder);
      });
      
      current[item.path[item.path.length - 1]] = translatedText;
    });

    return result;

  } catch (error: any) {
    console.error(`   ❌ Google Translate failed:`, error.message);
    return content;
  }
}

/**
 * Get all JSON files in the English translations folder
 */
function getTranslationFiles(): string[] {
  const enDir = path.join(process.cwd(), 'messages', 'en');
  
  if (!fs.existsSync(enDir)) {
    console.error('❌ English translations folder not found at:', enDir);
    console.log('\n💡 Run `npx tsx scripts/split-translations.ts` first to create the folder structure');
    process.exit(1);
  }

  return fs.readdirSync(enDir)
    .filter(file => file.endsWith('.json'))
    .sort();
}

/**
 * Extract only untranslated keys from English content
 * A key is considered untranslated if:
 * 1. It doesn't exist in the target translation, OR
 * 2. Its value matches the English value (likely not translated)
 */
function extractUntranslatedKeys(
  enContent: TranslationObject,
  existingContent: TranslationObject
): TranslationObject {
  const untranslated: TranslationObject = {};

  function extractRecursive(
    enObj: TranslationObject,
    existingObj: TranslationObject,
    result: TranslationObject
  ) {
    for (const [key, value] of Object.entries(enObj)) {
      if (typeof value === 'string') {
        // String value: check if missing or matches English
        const existingValue = existingObj[key];
        if (!existingValue || existingValue === value) {
          result[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Nested object: recurse
        const existingNested = existingObj[key] as TranslationObject | undefined;
        if (!existingNested || typeof existingNested !== 'object') {
          // Entire nested object is missing, include it
          result[key] = value;
        } else {
          // Nested object exists, check recursively
          const nestedResult: TranslationObject = {};
          extractRecursive(value, existingNested, nestedResult);
          if (Object.keys(nestedResult).length > 0) {
            result[key] = nestedResult;
          }
        }
      }
    }
  }

  extractRecursive(enContent, existingContent, untranslated);
  return untranslated;
}

/**
 * Deep merge two translation objects, preserving existing translations
 */
function mergeTranslations(
  existing: TranslationObject,
  newTranslations: TranslationObject
): TranslationObject {
  const merged = JSON.parse(JSON.stringify(existing)); // Deep clone existing

  function mergeRecursive(
    target: TranslationObject,
    source: TranslationObject
  ) {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'string') {
        // String value: overwrite if it's a new translation
        target[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        // Nested object: merge recursively
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        mergeRecursive(target[key] as TranslationObject, value);
      }
    }
  }

  mergeRecursive(merged, newTranslations);
  return merged;
}

/**
 * Translate a single file to target language
 */
async function translateFile(
  fileName: string,
  targetLang: string,
  useOpenAI: boolean,
  force: boolean = false
): Promise<void> {
  const enPath = path.join(process.cwd(), 'messages', 'en', fileName);
  const targetDir = path.join(process.cwd(), 'messages', targetLang);
  const targetPath = path.join(targetDir, fileName);

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Read English content
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  // Check if target file already exists
  let existingContent: TranslationObject = {};
  if (fs.existsSync(targetPath) && !force) {
    try {
      existingContent = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    } catch (error) {
      console.warn(`   ⚠️  Could not read existing ${targetLang}/${fileName}, will translate all keys`);
    }
  }

  // If force is enabled, translate all keys; otherwise extract only untranslated keys
  const keysToTranslate = force ? enContent : extractUntranslatedKeys(enContent, existingContent);
  
  if (!force && Object.keys(keysToTranslate).length === 0) {
    console.log(`   ⏭️  Skipped ${fileName} (all keys already translated)`);
    return;
  }

  // Translate keys
  const newTranslations = useOpenAI
    ? await translateWithOpenAI(keysToTranslate, targetLang, fileName)
    : await translateWithGoogle(keysToTranslate, targetLang);

  // If force is enabled, use new translations directly; otherwise merge with existing
  const finalContent = force ? newTranslations : mergeTranslations(existingContent, newTranslations);

  // Write content to target language file
  fs.writeFileSync(
    targetPath,
    JSON.stringify(finalContent, null, 2),
    'utf-8'
  );

  // Count string values recursively
  function countStrings(obj: TranslationObject): number {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        count++;
      } else if (typeof value === 'object' && value !== null) {
        count += countStrings(value);
      }
    }
    return count;
  }

  const translatedCount = countStrings(keysToTranslate);
  const totalCount = countStrings(enContent);
  const status = force ? 're-translated' : 'translated';
  console.log(`   ✓ ${status.charAt(0).toUpperCase() + status.slice(1)} ${fileName} (${translatedCount}/${totalCount} keys)`);
}

/**
 * Main translation function with PARALLEL PROCESSING
 */
async function translateAll() {
  const args = process.argv.slice(2);
  const specificLang = args.find(arg => arg.startsWith('--lang='))?.split('=')[1];
  const useOpenAI = args.includes('--openai') || !!process.env.OPENAI_API_KEY;
  const parallelLanguages = args.includes('--parallel-langs'); // Translate all languages at once
  const force = args.includes('--force') || args.includes('--force-all'); // Force translate all keys

  console.log('🌍 Starting translation process...\n');
  console.log(`📝 Translation method: ${useOpenAI ? 'OpenAI GPT-4' : 'Google Translate (BATCHED)'}`);
  console.log(`⚡ Parallel processing: ${parallelLanguages ? 'ALL LANGUAGES' : 'FILES ONLY'}`);
  console.log(`🔄 Force mode: ${force ? 'ENABLED (all keys will be re-translated)' : 'DISABLED (only untranslated keys)'}`);
  
  if (useOpenAI && !process.env.OPENAI_API_KEY) {
    console.log('\n⚠️  OPENAI_API_KEY not set, will use Google Translate as fallback');
  }

  const files = getTranslationFiles();
  console.log(`📁 Found ${files.length} translation files\n`);

  let languagesToProcess = specificLang 
    ? [specificLang]
    : LANGUAGES_TO_TRANSLATE;

  // Filter out English (en) since it's the source language
  languagesToProcess = languagesToProcess.filter(lang => lang !== 'en');

  if (languagesToProcess.length === 0) {
    console.log('ℹ️  No languages to translate (English is skipped as it\'s the source language)');
    process.exit(0);
  }

  const startTime = Date.now();

  if (parallelLanguages) {
    // Translate all languages in parallel (fastest but uses more API quota)
    console.log('🚀 Translating ALL languages in parallel...\n');
    
    await Promise.all(
      languagesToProcess.map(async (lang) => {
        const languageName = getLanguageName(lang);
        console.log(`🌐 Starting ${languageName} (${lang})...`);
        
        // Translate all files for this language in parallel
        await Promise.all(
          files.map(file => 
            translateFile(file, lang, useOpenAI, force).catch(error => {
              console.error(`   ❌ ${lang}/${file}:`, error.message);
            })
          )
        );
        
        console.log(`✅ Completed ${languageName}!`);
      })
    );
  } else {
    // Translate languages sequentially, but files in parallel
    for (const lang of languagesToProcess) {
      const languageName = getLanguageName(lang);
      console.log(`\n🌐 Translating to ${languageName} (${lang})...`);
      console.log('─'.repeat(50));

      // Translate all files in parallel (much faster!)
      await Promise.all(
        files.map(file => 
          translateFile(file, lang, useOpenAI, force).catch(error => {
            console.error(`   ❌ Error translating ${file}:`, error.message);
          })
        )
      );

      console.log(`\n✅ Completed ${languageName} translation!`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log(`✨ All translations completed in ${duration}s!`);
  console.log('\n📁 Translation files created in:');
  languagesToProcess.forEach(lang => {
    console.log(`   • messages/${lang}/`);
  });
  console.log('\n💡 Next steps:');
  console.log('   1. Review the translations for accuracy');
  console.log('   2. Test your app in different languages');
  console.log('   3. Make manual adjustments where needed');
}

// Run the translation
translateAll().catch(error => {
  console.error('\n❌ Translation failed:', error);
  process.exit(1);
});

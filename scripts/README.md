# Translation Scripts

## Automatic Translation

This directory contains scripts to automatically translate your i18n files.

### Setup

1. Install OpenAI package (if using AI translation):
```bash
npm install openai
```

2. Set up your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### Usage

#### Translate all languages:
```bash
npx ts-node scripts/translate.ts
```

#### Translate specific language:
```bash
npx ts-node scripts/translate.ts --lang=es
```

#### Supported Languages

- `es` - Spanish (Español)
- `fr` - French (Français)
- `zh` - Chinese (中文)
- `de` - German (Deutsch)
- `ja` - Japanese (日本語)
- `ko` - Korean (한국어)
- `pt` - Portuguese (Português)
- `ar` - Arabic (العربية)

### Manual Translation

If you prefer manual translation or want to review AI translations:

1. Copy `messages/en.json` to a new language file
2. Translate all VALUES (keep keys in English)
3. Test in your app

### Best Practices

1. **Always review AI translations** - AI is good but not perfect
2. **Keep placeholders** - Don't translate `{name}`, `{date}`, etc.
3. **Context matters** - Some words have different meanings in different contexts
4. **Cultural adaptation** - Consider cultural differences, not just literal translation
5. **Professional review** - For production, have native speakers review

### Translation Quality

For highest quality translations:
- Use AI for initial translation (fast, consistent)
- Review by native speakers
- Test in the actual UI
- Gather user feedback

### Alternative Services

If you don't want to use OpenAI, you can integrate:
- **Google Cloud Translation** - Professional, pay-per-character
- **DeepL API** - High quality, limited free tier
- **AWS Translate** - Part of AWS suite
- **Lokalise/Phrase** - Translation management platforms with AI


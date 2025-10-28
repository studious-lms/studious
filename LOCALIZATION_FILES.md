# Files Requiring Translation/Localization

## ✅ Completed
- src/components/ui/pagination.tsx
- messages/en.json, es.json, fr.json, zh.json (pagination added)

## 📱 Software Application Pages

### Class Detail Pages
**Files:**
- `src/app/(software)/class/[id]/page.tsx` - DONE
- `src/app/(software)/class/[id]/assignments/page.tsx` - DONE
- `src/app/(software)/class/[id]/grades/page.tsx`
- `src/app/(software)/class/[id]/members/page.tsx`
- `src/app/(software)/class/[id]/files/page.tsx`
- `src/app/(software)/class/[id]/settings/page.tsx`
- `src/app/(software)/class/[id]/syllabus/page.tsx`
- `src/app/(software)/class/[id]/attendance/page.tsx`

### Other Pages
**Files:**
- `src/app/(software)/notifications/page.tsx`
- `src/app/(software)/chat/[id]/page.tsx`

## 🧩 UI Components

### Already Using Translations (Partial)
- `src/components/ui/primary-sidebar.tsx` (navigation done)
- `src/components/marketing/Navbar.tsx` (partially done)

### Need Translation
- Various modals in `src/components/modals/`
- Event/Calendar components
- Form components
- Other UI components with hardcoded text

## 📝 Notes

This is a large-scale localization effort. Priority should be:
1. Marketing pages (user acquisition)
2. Core software pages (user-facing)
3. UI components
4. Modals and forms

All translation keys should be added to `messages/en.json` first, then translated to other languages using the translation script.

export const LanguageEnum = {
  Japanese: 'Japanese',
  English: 'English',
} as const;
export type LanguageEnum = (typeof LanguageEnum)[keyof typeof LanguageEnum];

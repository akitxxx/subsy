import { LanguageEnum } from '@/shared/enums/language.enum';

/**
 * 言語検出ユーティリティ
 */

/**
 * テキストが日本語かどうかを判定する
 * 日本語の文字（ひらがな、カタカナ、漢字）が含まれているかをチェック
 */
const detectLanguage = (text: string): LanguageEnum => {
  // 日本語の文字（ひらがな、カタカナ、漢字）の正規表現
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japaneseRegex.test(text) ? LanguageEnum.Japanese : LanguageEnum.English;
};

export const LanguageUtils = {
  detectLanguage,
};

/**
 * 日付操作ユーティリティ
 *
 * このモジュールでは標準のDateオブジェクトを使用したAPIを提供し、
 * 内部実装の詳細（dayjs等）を完全に隠蔽します。
 */

import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';

// 日本語ロケールを設定
dayjs.locale(ja);

/**
 * 日付操作の抽象インターフェース
 * 内部実装の詳細を隠蔽するための型定義
 */
interface IDateAdapter {
  /**
   * 日付文字列をフォーマットする
   */
  format(date: Date, formatStr: string): string;

  /**
   * 年月日を指定して日付を更新
   */
  setDate(date: Date, year: number, month: number, day: number): Date;

  /**
   * 時分を指定して日付を更新
   */
  setTime(date: Date, hours: number, minutes: number): Date;

  /**
   * 日付を指定されたフォーマットで解析
   */
  parse(dateStr: string, formatStr: string): Date | null;
}

/**
 * DayJSアダプター実装
 * dayjsライブラリに依存する実装をカプセル化
 */
class DayjsAdapter implements IDateAdapter {
  format(date: Date, formatStr: string): string {
    return dayjs(date).format(formatStr);
  }

  setDate(date: Date, year: number, month: number, day: number): Date {
    return dayjs(date)
      .year(year)
      .month(month - 1) // dayjsは0-11の月表現
      .date(day)
      .toDate();
  }

  setTime(date: Date, hours: number, minutes: number): Date {
    return dayjs(date).hour(hours).minute(minutes).toDate();
  }

  parse(dateStr: string, formatStr: string): Date | null {
    const parsed = dayjs(dateStr, formatStr);
    return parsed.isValid() ? parsed.toDate() : null;
  }
}

// 実装を切り替えるためのファクトリ
// テスト時やライブラリ変更時に差し替え可能
const getDateAdapter = (): IDateAdapter => {
  return new DayjsAdapter();
};

// 内部で使用するadapterインスタンス
const dateAdapter = getDateAdapter();

// ===============================
// 公開API定義
// ===============================

/**
 * 日付生成
 */
const create = {
  /**
   * 現在時刻の日付を取得
   */
  now: (): Date => {
    return new Date();
  },

  /**
   * ISO文字列から日付を生成
   */
  fromISOString: (isoString: string | null): Date | null => {
    if (!isoString) return null;

    try {
      const date = new Date(isoString);
      // 無効な日付のチェック
      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  },

  /**
   * 特定のフォーマットの文字列から日付を生成
   */
  fromFormat: (dateStr: string, format: string): Date | null => {
    return dateAdapter.parse(dateStr, format);
  },
};

/**
 * 日付操作
 */
const modify = {
  /**
   * ミリ秒を加算
   */
  addMilliseconds: (date: Date, milliseconds: number): Date => {
    const newDate = new Date(date);
    newDate.setMilliseconds(newDate.getMilliseconds() + milliseconds);
    return newDate;
  },

  /**
   * 秒を加算
   */
  addSeconds: (date: Date, seconds: number): Date => {
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
  },

  /**
   * 分を加算
   */
  addMinutes: (date: Date, minutes: number): Date => {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  },

  /**
   * 時間を加算
   */
  addHours: (date: Date, hours: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  },

  /**
   * 日を加算
   */
  addDays: (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  },

  /**
   * 月を加算
   */
  addMonths: (date: Date, months: number): Date => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  },

  /**
   * 年を加算
   */
  addYears: (date: Date, years: number): Date => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  },

  /**
   * 日付部分（年月日）を設定
   */
  setDatePart: (baseDate: Date, year: number, month: number, day: number): Date => {
    return dateAdapter.setDate(baseDate, year, month, day);
  },

  /**
   * 時間部分（時分）を設定
   */
  setTimePart: (baseDate: Date, hours: number, minutes: number): Date => {
    return dateAdapter.setTime(baseDate, hours, minutes);
  },

  /**
   * 日付フォーム入力からの更新
   */
  updateFromDateInput: (baseDate: Date, dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return dateAdapter.setDate(baseDate, year, month, day);
  },

  /**
   * 時間フォーム入力からの更新
   */
  updateFromTimeInput: (baseDate: Date, timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return dateAdapter.setTime(baseDate, hours, minutes);
  },
};

/**
 * 日付フォーマット
 */
const format = {
  /**
   * ISO文字列に変換
   */
  toISOString: (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString();
  },

  /**
   * 日付入力フィールド用のフォーマット (YYYY-MM-DD)
   */
  forDateInput: (date: Date): string => {
    return dateAdapter.format(date, 'YYYY-MM-DD');
  },

  /**
   * 時間入力フィールド用のフォーマット (HH:mm)
   */
  forTimeInput: (date: Date): string => {
    return dateAdapter.format(date, 'HH:mm');
  },

  /**
   * 表示用のフォーマット (YYYY年MM月DD日 HH:mm)
   */
  forDisplay: (date: Date): string => {
    return dateAdapter.format(date, 'YYYY年MM月DD日 HH:mm');
  },

  /**
   * カスタムフォーマット
   */
  custom: (date: Date, formatStr: string): string => {
    return dateAdapter.format(date, formatStr);
  },
};

/**
 * 日付比較・判定
 */
const compare = {
  /**
   * 2つの日付が同じ日かどうか
   */
  isSameDay: (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  },

  /**
   * date1がdate2より前かどうか
   */
  isBefore: (date1: Date, date2: Date): boolean => {
    return date1.getTime() < date2.getTime();
  },

  /**
   * date1がdate2より後かどうか
   */
  isAfter: (date1: Date, date2: Date): boolean => {
    return date1.getTime() > date2.getTime();
  },
};

// 公開API
export const DateUtils = {
  create,
  modify,
  format,
  compare,
};

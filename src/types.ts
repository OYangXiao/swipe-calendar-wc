export interface Date_Info {
  year: number;
  month: number;
  date: number;

  date_name: string;
  month_name: string;
  week_name: string;

  day: number;
  week_index: number;
}

export type ViewType = 'month' | 'week';

export type WeekStartDay = 0 | 1;

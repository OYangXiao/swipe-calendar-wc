/// <reference types="vite/client" />

import { weekdays } from './date-tool';

declare global {
  interface Date_Info {
    year: number;
    month: number;
    date: number;

    date_name: string;
    month_name: string;
    week_name:string;

    day: number;
    week_index: number;
  }

  type ViewType = 'month' | 'week';

  type WeekStartDay = 0 | 1;
}

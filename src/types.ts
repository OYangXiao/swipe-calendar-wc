import { Dayjs } from "dayjs";

export interface Date_Info {
  time: Dayjs;

  // 为了保证月份视图展示完整,
  // 部分日期超出范围依然会被创建,
  // 但是会被标记为 out_of_range
  out_of_range?: true;
}

export type ViewType = 'month' | 'week';

export type WeekStartDay = 0 | 1;

import dayjs, { type Dayjs } from 'dayjs';
import { Date_Info, ViewType, WeekStartDay } from '../types';

function always_true(_time: Dayjs) {
  return true;
}
const CALENDAR_CONFIG = {
  week_start_day: 0 as WeekStartDay,
  no_weekends: false,
};

const RANGE_CHECK = {
  month: always_true,
  week: always_true,
};

type TimeBoundary = Array<{ type: 'max' | 'min'; time: string }>;

// 缓存每个周的数据
// key: 用周一的日期作为周的名字, 例如: 2020-01-01, 因为无论是否有周末,是否使用周一作为第一天,每周都有周一
// value: 周的数据, 格式为Dayjs[]
const WEEKS = new Map<string, Dayjs[]>();

const FORMAT = {
  month: 'YYYY-MM',
  week: 'YYYY-MM-DD',
};

function check_time_in_range(view: ViewType, boundary: TimeBoundary) {
  const time_checkers = boundary
    // date必须是有效输入
    .filter(({ time }) => !!time)
    .map(({ type, time }) => ({
      type,
      time: dayjs(time),
    }))
    // date必须是有效时间
    .filter(({ time }) => time.isValid())
    .map(
      ({ type, time: _time }) =>
        (time: Dayjs) =>
          // 如果是最大值,则time必须小于等于max_date
          // 如果是最小值,则time必须大于等于min_date
          time.isSame(_time, view) ||
          (type === 'max'
            ? time.isBefore(_time, view)
            : time.isAfter(_time, view))
    );

  if (time_checkers.length === 0) {
    return always_true;
  } else {
    return (time: Dayjs) => time_checkers.every((checker) => checker(time));
  }
}

export function set_calendar_config(
  week_start_day: WeekStartDay,
  no_weekends: boolean
) {
  CALENDAR_CONFIG.no_weekends = no_weekends;
  // 如果不展示周末,则周一为第一天
  CALENDAR_CONFIG.week_start_day = no_weekends ? 1 : week_start_day;
  // 每当设置变化时,就重置数据
  WEEKS.clear();
}

export function set_range(boundary: TimeBoundary) {
  RANGE_CHECK.month = check_time_in_range('month', boundary);
  RANGE_CHECK.week = check_time_in_range('week', boundary);
}

function generate_week(time: Dayjs) {
  const { no_weekends, week_start_day } = CALENDAR_CONFIG;
  const day_0 = time.startOf('week')
  const start_day = day_0.add(week_start_day, 'day');
  // 永远使用周一的日期作为周的名字
  const week_name = day_0.day(1).format(FORMAT.week);
  if (WEEKS.has(week_name)) {
    return WEEKS.get(week_name)!;
  } else {
    const week = Array(no_weekends ? 5 : 7)
      .fill(0)
      .map((_, i) => ({
        date:start_day.add(i, 'day'),
        disabled: RANGE_CHECK
      });
    WEEKS.set(week_name, week);
    return week;
  }
}

function generate_month(time: Dayjs) {
  const month_1st = time.startOf('month');
  const month_name = month_1st.format(FORMAT.month);
  if (WEEKS.has(month_name)) {
    return WEEKS.get(month_name)!;
  } else {
  const { no_weekends, week_start_day } = CALENDAR_CONFIG;
    const weeks = [];
    let week = generate_week(month_1st);
    while (RANGE_CHECK.week(week[0])) {
}

export function generate_view(time: Dayjs, view: ViewType) {
  const view_window = [time.add(-1, view), time, time.add(1, view)].map((t) =>
  view === 'week' ? [generate_week(t)] : 

}

import type { WeekStartDay, Date_Info } from '../types';

export const DEFAULT_WEEKDAY_NAME = ['日', '一', '二', '三', '四', '五', '六'];

export const BOUNDARY = {
  max: undefined as undefined | Date_Info,
  min: undefined as undefined | Date_Info,
};

export const WEEK_CONFIG = {
  // 一旦写入这些值,外面传入的week_start_day和no_weekends就不会对已经缓存的数据产生影响
  week_start_day: undefined as undefined | WeekStartDay,
  no_weekends: undefined as undefined | boolean,
};

// MONTH是一个字符串数组,按顺序包含一个月的所有week_name
export const MONTHS = new Map<
  string,
  // 记录这个月的第一天,最后一天,以及复盖到的week_name
  {
    first_date_name: string;
    last_date_name: string;
    date_count: number;
    week_names: string[];
  }
>();
// WEEK是一个字符串数组,按顺序包含一个week的所有date_name
export const WEEKS = new Map<
  string,
  {
    month_names: string[]; // 某些week复盖到两个月,这里记录他们
    date_names: string[];
  }
>();
export const DATES = new Map<string, Date_Info>();

export function check_time_in_range(time: Date_Info, type: 'max' | 'min') {
  if (!BOUNDARY[type]) return true;
  const range = BOUNDARY[type]!;
  if (type === 'max') {
    return (
      time.year < range.year ||
      (time.year === range.year && time.month < range.month) ||
      (time.year === range.year &&
        time.month === range.month &&
        time.date <= range.date)
    );
  } else {
    return (
      time.year > range.year ||
      (time.year === range.year && time.month > range.month) ||
      (time.year === range.year &&
        time.month === range.month &&
        time.date >= range.date)
    );
  }
}

export function create_date_info(time: Date): Date_Info {
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const date = time.getDate();

  return {
    year,
    month,
    date,

    date_name: `${year}-${month}-${date}`,
    month_name: `${year}-${month}`,
    week_name: '',

    day: time.getDay(),
    week_index: 0,
  };
}

// generate month dates grouped by weeks
// fill empty dates with last month dates and next month dates
function generate_month_data(year: number, month: number) {
  // console.warn('\n\ncalc new month', year, month, '\n\n');
  const month_name = `${year}-${month}`;

  const no_weekends = WEEK_CONFIG.no_weekends!;
  const week_start_day = WEEK_CONFIG.week_start_day!;

  if (!MONTHS.has(month_name)) {
    let first_date_name = '';
    let last_date_name = '';
    let month_date_count = 0;
    const week_names: string[] = [];

    let day_count = -1;
    // 当前遍历到的week
    let date_names: string[] | undefined = undefined;

    // 向前6天,向后6天,保证没有空的日期
    while (day_count < 31 + 6 * 2) {
      day_count++;

      const date_info = create_date_info(
        new Date(year, month - 1, 1 - 6 + day_count)
      );

      let day_index_of_week =
        week_start_day === 1 ? date_info.day - 1 : date_info.day;
      // 在保留周末并且从周一开始的情况下,需要将周日的day_index变为6
      if (day_index_of_week < 0) day_index_of_week = 6;

      // 如果是周末,并且不需要周末,就跳过
      if (no_weekends && (date_info.day === 0 || date_info.day === 6)) {
        continue;
      }

      if (!first_date_name && date_info.month === month) {
        first_date_name = date_info.date_name;
      }
      if (date_info.month === month) {
        month_date_count++;
        last_date_name = date_info.date_name;
      }

      if (week_start_day === date_info.day) {
        // 如果这一天是一周的开始,就切换week的引用
        // week的名字是这一周的第一天的名字
        const exist_week = WEEKS.get(date_info.date_name);
        date_names =
          exist_week?.date_names || Array(no_weekends ? 5 : 7).fill(undefined);
      } else if (!date_names) {
        // console.warn('NOOOOOOOOOOOOOOO WEEK');
        // 如果这一天不是一周的开始,就继续使用上一次的week的引用
        // 但是如果week变量还没有被初始化,就代表这是多余出来的天数,抛弃掉
        continue;
      }

      if (date_names) {
        if (!date_names[day_index_of_week]) {
          date_names[day_index_of_week] = date_info.date_name;
          DATES.set(date_info.date_name, date_info);
        }

        // 如果当前循环的week已经被填满,
        // 并且刚才设置的是这一周的最后一天
        // 并且这一周是当前月的,就将它的名字写入month_names
        // 就将它写入months_weeks_dates
        // 如果生成了一个不属于需要的月份的week,就丢弃掉,以保证所有cache的week都属于用到的月份
        if (
          day_index_of_week === (no_weekends ? 4 : 6) &&
          date_names[date_names.length - 1] &&
          date_names.some(
            (date_name) => DATES.get(date_name)!.month_name === month_name
          )
        ) {
          const week_name = date_names[0];
          const month_names: string[] = [];

          date_names.forEach((date_name) => {
            const date_info = DATES.get(date_name)!;
            // 不重复的计算这个week都有哪些月份
            if (!month_names.includes(date_info.month_name)) {
              month_names.push(date_info.month_name);
            }
            date_info.week_name = week_name;
            if (date_info.month_name === month_name) {
              date_info.week_index = week_names.length;
            }
          });
          week_names.push(week_name);

          if (!WEEKS.has(week_name)) {
            WEEKS.set(week_name, { date_names, month_names });
          }
        }
      }
    }
    MONTHS.set(month_name, {
      week_names,
      first_date_name,
      last_date_name,
      date_count: month_date_count,
    });
  }
}

export const date_converter = {
  to_date: function (calendarDate: Date_Info) {
    return new Date(
      calendarDate.year,
      calendarDate.month - 1,
      calendarDate.date
    );
  },
  from_input: function (time?: Date | string | null): Date_Info {
    let _time = !!time && new Date(time);
    if (_time && isNaN(_time.getTime())) {
      if (typeof time === 'string') {
        const splitter = time.includes('-')
          ? '-'
          : time.includes('/')
          ? '/'
          : undefined;
        if (splitter) {
          const [year, month, date] = time
            .split(splitter)
            .map((v) => parseInt(v));
          if (isNaN(year) || isNaN(month) || isNaN(date)) {
            _time = new Date();
          } else {
            _time = new Date(year, month - 1, date);
          }
        }
      }
    }
    if (!_time || isNaN(_time.getTime())) {
      _time = new Date();
    }

    if (
      WEEK_CONFIG.no_weekends &&
      (_time.getDay() === 0 || _time.getDay() === 6)
    ) {
      if (_time.getDay() === 0) {
        _time.setDate(_time.getDate() + 1);
      } else if (_time.getDay() === 6) {
        _time.setDate(_time.getDate() - 1);
      }
    }
    const year = _time.getFullYear();
    const month = _time.getMonth() + 1;

    // 前后各取一个月的数据,保证没有空的日期
    [
      month < 2 ? { year: year - 1, month: 12 } : { year, month: month - 1 },
      { year, month },
      month > 11 ? { year: year + 1, month: 1 } : { year, month: month + 1 },
    ].forEach(({ year, month }) => {
      generate_month_data(year, month);
    });

    const date = _time.getDate();
    const date_name = `${year}-${month}-${date}`;

    return DATES.get(date_name)!;
  },
};

export function prev_month(date_info: Date_Info) {
  const { year, month } = date_info;
  const p_year = month === 1 ? year - 1 : year;
  const p_month = month === 1 ? 12 : month - 1;
  return `${p_year}-${p_month}`;
}
export function next_month(date_info: Date_Info) {
  const { year, month } = date_info;
  const n_year = month === 12 ? year + 1 : year;
  const n_month = month === 12 ? 1 : month + 1;
  return `${n_year}-${n_month}`;
}
export function prev_week(date_info: Date_Info) {
  const { month_name, week_index } = date_info;
  if (week_index === 0) {
    const p_month = prev_month(date_info);
    const p_month_weeks = MONTHS.get(p_month)!.week_names;
    let p_month_week = p_month_weeks[p_month_weeks.length - 1];
    // 从x月的第一周查找上一周的时候,x-1月的最后一周可能和x月的第一周重合,这时候就要取x-1月的倒数第二周
    if (p_month_week === date_info.week_name) {
      p_month_week = p_month_weeks[p_month_weeks.length - 2];
    }
    return p_month_week;
  } else {
    const month_weeks = MONTHS.get(month_name)!.week_names;
    const p_week = month_weeks[week_index - 1];
    return p_week;
  }
}
export function next_week(date_info: Date_Info) {
  const { month_name, week_index } = date_info;
  const month_weeks = MONTHS.get(month_name)!.week_names;
  if (week_index === month_weeks.length - 1) {
    const n_month = next_month(date_info);
    let n_month_week = MONTHS.get(n_month)!.week_names[0];
    // 从x月的最后一周查找下一周的时候,x+1月的第一周可能和x月的最后一周重合,这时候就要取x+1月的第二周
    if (n_month_week === date_info.week_name) {
      n_month_week = MONTHS.get(n_month)!.week_names[1];
    }
    return n_month_week;
  } else {
    const n_week = month_weeks[week_index + 1];
    return n_week;
  }
}

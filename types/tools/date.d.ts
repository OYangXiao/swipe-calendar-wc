import type { WeekStartDay, Date_Info } from '../types';
export declare const DEFAULT_WEEKDAY_NAME: string[];
export declare const BOUNDARY: {
    max: Date_Info | undefined;
    min: Date_Info | undefined;
};
export declare const WEEK_CONFIG: {
    week_start_day: WeekStartDay | undefined;
    no_weekends: boolean | undefined;
};
export declare const MONTHS: Map<string, {
    first_date_name: string;
    last_date_name: string;
    date_count: number;
    week_names: string[];
}>;
export declare const WEEKS: Map<string, {
    month_names: string[];
    date_names: string[];
}>;
export declare const DATES: Map<string, Date_Info>;
export declare function check_time_in_range(time: Date_Info, type: 'max' | 'min'): boolean;
export declare function create_date_info(time: Date): Date_Info;
export declare const date_converter: {
    to_date: (calendarDate: Date_Info) => Date;
    from_input: (time?: Date | string | null) => Date_Info;
};
export declare function prev_month(date_info: Date_Info): string;
export declare function next_month(date_info: Date_Info): string;
export declare function prev_week(date_info: Date_Info): string;
export declare function next_week(date_info: Date_Info): string;

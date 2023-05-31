export declare function dateToCalendarDate(date?: Date | null | string): CalendarDate;
export declare function calendarDateToDate(calendarDate: CalendarDate): Date;
export declare const weekdays: {
    Mon: string[];
    Sun: string[];
};
export declare const weekdaysDisplay: {
    readonly Mon: "一";
    readonly Tue: "二";
    readonly Wed: "三";
    readonly Thu: "四";
    readonly Fri: "五";
    readonly Sat: "六";
    readonly Sun: "日";
};
export declare function generateMonthDates(_year: string, _month: string, startDayOfWeek?: "Mon" | "Sun", excludeWeekends?: boolean): Array<CalendarDate[]>;

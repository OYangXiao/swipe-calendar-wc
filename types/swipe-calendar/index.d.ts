import { LitElement } from "lit";
import "./week-title";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class SwipeCalendar extends LitElement {
    constructor();
    initDate: CalendarDate;
    maxDate: undefined;
    minDate: undefined;
    disabledDate: ((date: CalendarDate) => boolean) | undefined;
    initView: "month" | "week";
    excludeWeekends: boolean;
    startDayOfWeek: "Sun" | "Mon";
    titleStyle?: string;
    cellStyle?: string;
    cellTextStyle?: string;
    currentDateStyle?: string;
    disabledDateStyle?: string;
    cellHeight: number;
    setDate(date: any): void;
    setView(view: "month" | "week"): void;
    toggleViewChange(): void;
    private _currentView;
    private _currentDate;
    private _offset_x;
    private _cached_month_dates;
    private _showing_months;
    private _touching;
    private _touch_start;
    /**
     * 初始化视图
     * @param changedProperties
     */
    willUpdate(changedProperties: Map<string, any>): void;
    /**
     * 生成月视图的数据
     */
    private _generateMonthView;
    /**
     * 触摸开始
     */
    private _onTouchStart;
    /**
     * 触摸结束
     * 如果是横向滑动就是切换日期, 上一个月下一个月(或者上一周下一周)
     * 如果是纵向滑动就是切换视图, 向下就是展开为月视图, 向上就是收起为周视图
     */
    private _onTouchEnd;
    /**
     * 触摸移动
     * 如果是横向滑动就记录偏移量, 让视图跟着偏移
     */
    private _onTouchMove;
    private _onClick;
    /**
     * 月视图的模板
     */
    private _month_template;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "swipe-calendar": SwipeCalendar;
    }
}

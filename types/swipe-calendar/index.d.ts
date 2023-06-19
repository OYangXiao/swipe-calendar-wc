import { LitElement, PropertyValueMap } from 'lit';
import type { Date_Info, ViewType, WeekStartDay } from '../types';
import { type WeekdayTitle } from './weekday-title';
import './weekday-title';
import { type SwipeBox } from './swipe-box';
import './swipe-box';
import { type DayCell } from './day-cell';
import './day-cell';
export type DateChangeEvent = CustomEvent<{
    date: Date_Info;
    view: ViewType;
    month: {
        first_date_name: string;
        last_date_name: string;
        date_count: number;
        week_names: string[];
        dates: string[];
    };
    prev_month_dates: string[];
    next_month_dates: string[];
    week: {
        month_names: string[];
        date_names: string[];
    };
}>;
/**
 * a calendar element
 *
 * change month by swipe left or right
 * change view between month and week by swipe up or down
 *
 * select date by click or tap
 *
 * @fires date-change - fires when date changed
 *
 */
export declare class SwipeCalendar extends LitElement {
    'selected-date': string;
    'view': ViewType;
    'no-weekends': boolean;
    'equal-trailing-days': boolean;
    'max-date'?: string;
    'min-date'?: string;
    'week-start-day': WeekStartDay;
    'weekday-name': string[];
    'cell-height': number;
    'style-cell-title'?: string;
    'style-cell-date'?: string;
    'style-date-normal'?: string;
    'style-date-selected'?: string;
    'style-date-today'?: string;
    'style-date-disabled'?: string;
    'style-date-not-this-month'?: string;
    'filter_hide'?: (date: Date_Info) => boolean;
    'filter_disable'?: (date: Date_Info) => boolean;
    setDate(date: any): void;
    setView(view: 'month' | 'week'): void;
    toggleViewChange(): void;
    private _selected_date;
    private _showing_times;
    private _swipe_box?;
    private _on_view_change;
    private _on_date_change;
    private _on_click;
    willUpdate(changedProperties: PropertyValueMap<any>): void;
    protected firstUpdated(): void;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'swipe-calendar': SwipeCalendar;
        'swipe-box': SwipeBox;
        'weekday-title': WeekdayTitle;
        'day-cell': DayCell;
    }
}

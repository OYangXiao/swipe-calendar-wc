import { LitElement, PropertyValueMap } from 'lit';
import './weekday-title';
import './swipe-box';
import './day-cell';
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class SwipeCalendar extends LitElement {
    'selected-date': string;
    'view': ViewType;
    'no-weekends': boolean;
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
    private _on_view_change;
    private _on_date_change;
    private _on_click;
    willUpdate(changedProperties: PropertyValueMap<any>): void;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'swipe-calendar': SwipeCalendar;
    }
}

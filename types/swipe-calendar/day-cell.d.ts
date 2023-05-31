import { LitElement, PropertyValueMap } from 'lit';
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class DayCell extends LitElement {
    'date-name': string;
    'month-name'?: string;
    'selected-date': Date_Info;
    'cell-height': number;
    'style-cell-date'?: string;
    'style-date-normal'?: string;
    'style-date-selected'?: string;
    'style-date-today'?: string;
    'style-date-disabled'?: string;
    'style-date-not-this-month'?: string;
    'style-cell-title'?: string;
    filter_disable?: (date: Date_Info) => boolean;
    filter_hide?: (date: Date_Info) => boolean;
    private _is_today;
    private _date;
    private _is_selected;
    private _is_hidden;
    private _is_disabled;
    private _not_this_month;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    render(): import("lit").TemplateResult<1> | undefined;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'day-cell': DayCell;
    }
}

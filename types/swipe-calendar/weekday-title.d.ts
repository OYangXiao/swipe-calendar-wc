import { LitElement, PropertyValueMap } from 'lit';
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class WeekdayTitle extends LitElement {
    'no-weekends': boolean;
    'week-start-day': WeekStartDay;
    'weekday-name': string[];
    'style-cell-title'?: string;
    private _weekdays;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'weekday-title': WeekdayTitle;
    }
}

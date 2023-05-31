import { LitElement } from "lit";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class WeekTitle extends LitElement {
    excludeWeekends: boolean;
    startDayOfWeek: "Mon" | "Sun";
    titleStyle?: string;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "week-title": WeekTitle;
    }
}

import { LitElement } from 'lit';
export type UpdateCountEvent = CustomEvent<number>;
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class MyElement extends LitElement {
    /**
     * Copy for the read the docs hint.
     */
    docsHint: {
        desc: string;
    };
    /**
     * The number of times the button has been clicked.
     */
    count: number;
    render(): import("lit").TemplateResult<1>;
    private _onClick;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'my-element': MyElement;
    }
}

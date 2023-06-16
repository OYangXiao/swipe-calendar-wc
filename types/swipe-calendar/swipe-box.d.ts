import { LitElement, PropertyValueMap } from 'lit';
import type { ViewType, Date_Info } from '../types';
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class SwipeBox extends LitElement {
    constructor();
    'view': ViewType;
    'selected-date': Date_Info;
    'cell-height': number;
    private _offset_x;
    private _offset_y;
    private _total_height;
    private _no_transition;
    private _touch_start;
    private _after_animation_action?;
    private _body_width;
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
    private _after_time_transition;
    private _after_height_transition;
    change_view(offsetY?: number): void;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    protected firstUpdated(): void;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'swipe-box': SwipeBox;
    }
}

import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import * as date_tools from '../tools/date';
import type { ViewType, Date_Info } from '../types';

const { MONTHS, WEEKS, DATES } = date_tools;

const VIEW_CHANGE_THROTTLE_PIXEL = 10;

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('swipe-box')
export class SwipeBox extends LitElement {
  constructor() {
    super();
    this.addEventListener('touchstart', this._onTouchStart);
    this.addEventListener('touchend', this._onTouchEnd);
    this.addEventListener('touchmove', this._onTouchMove);
  }

  @property()
  'view'!: ViewType;

  @property({ type: Object })
  'selected-date'!: Date_Info;

  @property({ type: Number })
  'cell-height'!: number;

  // 左右滑动之后允许设置日期
  @property({ attribute: false })
  'on_swipe'?: (info: { view: ViewType; range: string[] }) => Date;

  // 触摸时的偏移X量, 用于动画
  @state()
  private _offset_x = 0;
  @state()
  private _offset_y = 0;
  @state()
  private _total_height = 0;
  @state()
  private _no_transition = false;

  private _next_date?: Date_Info;

  // 记录开始触摸的位置
  private _touch_start: undefined | { x: number; y: number } = undefined;
  private _after_animation_action?: () => void;

  // 记录body的宽度, 用于计算偏移量
  private _body_width = 0;

  /**
   * 触摸开始
   */
  private _onTouchStart(e: TouchEvent) {
    this._touch_start = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  /**
   * 触摸结束
   * 如果是横向滑动就是切换日期, 上一个月下一个月(或者上一周下一周)
   * 如果是纵向滑动就是切换视图, 向下就是展开为月视图, 向上就是收起为周视图
   */
  private async _onTouchEnd(e: TouchEvent) {
    if (!this._touch_start) {
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const offsetX = endX - this._touch_start.x;
    const offsetY = endY - this._touch_start.y;

    this._touch_start = undefined;
    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      this._no_transition = false;
      // 横向滑动就是上一个月下一个月(或者上一周下一周)
      if (Math.abs(this._offset_x) > 0.2 * this._body_width) {
        const new_date = await this._find_new_date();

        if (new_date) {
          this._offset_x =
            this._offset_x > 0 ? this._body_width : -this._body_width;
          this._next_date = new_date;
        } else {
          this._offset_x = 0;
        }
      } else {
        this._offset_x = 0;
      }
    }
  }

  /**
   * 触摸移动
   * 如果是横向滑动就记录偏移量, 让视图跟着偏移
   */
  private _onTouchMove(e: TouchEvent) {
    // 如果有一个动画正在进行, 就不要再触发了
    if (!this._touch_start) {
      return;
    }
    // this._touch.touch_moved = true;

    const moveX = e.touches[0].clientX;
    const moveY = e.touches[0].clientY;

    const offsetX = moveX - this._touch_start.x;
    const offsetY = moveY - this._touch_start.y;

    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      this._no_transition = true;
      // 横向滑动就是切换日期, 上一个月下一个月(或者上一周下一周)
      this._offset_x = offsetX;
    } else if (this.view === 'week' && offsetY > VIEW_CHANGE_THROTTLE_PIXEL) {
      this.change_view(offsetY);
    } else if (this.view === 'month' && offsetY < -VIEW_CHANGE_THROTTLE_PIXEL) {
      this.change_view(offsetY);
    }
  }

  private _after_time_transition() {
    if (this._next_date) {
      this.dispatchEvent(
        new CustomEvent('date-change', {
          detail: this._next_date,
        })
      );
      this._next_date = undefined;
    }
  }

  private async _find_new_date() {
    let date_name = '';
    let pick_time = undefined as Date | undefined;
    let range = [] as string[];

    const selected_date = this['selected-date'];
    const view = this.view;
    const direction = this._offset_x < 0 ? 'next' : 'prev';
    const new_time = date_tools[`${direction}_${view}`](selected_date);

    let week_name = '';
    if (view === 'month') {
      const month_weeks = MONTHS.get(new_time)!.week_names;
      if (this.on_swipe) {
        range = month_weeks
          .map((week_name) => WEEKS.get(week_name)!.date_names)
          .flat();
        pick_time = this.on_swipe({
          view: this.view,
          range,
        });
      } else {
        week_name =
          month_weeks[direction === 'prev' ? month_weeks.length - 1 : 0];
      }
    } else {
      if (this.on_swipe) {
        range = WEEKS.get(new_time)!.date_names;
        pick_time = this.on_swipe({
          view: this.view,
          range,
        });
      } else {
        week_name = new_time;
      }
    }

    if (pick_time instanceof Date) {
      console.log('on siwpe result', pick_time);
      const year = pick_time.getFullYear();
      const month = pick_time.getMonth() + 1;
      const date = pick_time.getDate();
      date_name = `${year}-${month}-${date}`;
      if (!range.includes(date_name)) {
        date_name = '';
      }
    } else if (week_name) {
      const week_dates = WEEKS.get(week_name)!.date_names;
      date_name =
        view === 'month'
          ? week_dates[direction === 'prev' ? 'findLast' : 'find'](
              (_date_name) => DATES.get(_date_name)!.month_name === new_time
            )!
          : week_dates[direction === 'prev' ? week_dates.length - 1 : 0];
    }

    const new_date = DATES.get(date_name);

    if (
      !new_date ||
      !date_tools.check_time_in_range(new_date, 'max') ||
      !date_tools.check_time_in_range(new_date, 'min')
    ) {
      return undefined;
    } else {
      return new_date;
    }
  }

  private _after_height_transition() {
    if (this._after_animation_action) {
      this._after_animation_action();
      this._after_animation_action = undefined;
    }
  }

  public change_view(offsetY?: number) {
    const _offsetY =
      typeof offsetY === 'undefined'
        ? (this.view === 'month' ? -1 : 1) * VIEW_CHANGE_THROTTLE_PIXEL
        : offsetY;

    // console.log('change view', offsetY, this.view, _offsetY);

    // 吃掉这次触摸事件, 防止触发点击事件
    this._touch_start = undefined;
    const { month_name, week_index } = this['selected-date'];
    // 纵向滑动就是切换视图, 向下就是展开为月视图, 向上就是收起为周视图
    this._offset_y = week_index * -this['cell-height'];

    if (_offsetY > 0) {
      // console.log('month name', month_name);
      // 切换到month视图
      this._total_height =
        MONTHS.get(month_name)!.week_names.length * this['cell-height'];

      // 从week切换到month期间, 会有一个动画
      // 需要立刻更新内容, 以免展开区域时内容不可见
      // console.log('dispatch view change', 'month', this._total_height);
      this.view = 'month';
      this.dispatchEvent(
        new CustomEvent('view-change', {
          detail: 'month',
        })
      );
    } else {
      this._no_transition = false;
      // 切换到week视图
      this._total_height = this['cell-height'];

      // 从month视图切换到week视图时, 会有一个动画
      // 可见内容逐渐减少
      // 动画期间保持可见内容不变
      // 直到动画结束后再更新内容
      // console.log(
      //   'dispatch view change',
      //   'week',
      //   this._total_height,
      //   this['cell-height']
      // );
      this.view = 'week';
      this._after_animation_action = () => {
        this.dispatchEvent(
          new CustomEvent('view-change', {
            detail: 'week',
          })
        );
      };
    }
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (
      _changedProperties.has('selected-date') ||
      _changedProperties.has('view')
    ) {
      this._offset_x = 0;
      if (_changedProperties.get('view') === 'week' && this.view === 'month') {
        // console.log('change view1', 'week -> month');
        // console.log('change selected date1', this['selected-date']);
        // 如果是从week视图切换到month视图
        // 设置一个timeout保证view正确渲染
        // 然后再设置新的offset_y即可产生动画
        this._no_transition = true;
        setTimeout(() => {
          this._no_transition = false;
          this._offset_y = 0;
        }, 0);
      } else if (
        _changedProperties.get('view') === 'month' &&
        this.view === 'week'
      ) {
        // console.log('change view2', 'month -> week');
        // console.log('change selected date2', this['selected-date']);
        // 如果是从month视图切换到week视图
        this._no_transition = true;
        this._offset_y = 0;
      } else {
        // console.log('change selected date3, changed date', this['selected-date']);
        this._no_transition = true;
        this._offset_y = 0;
        this._total_height =
          (this.view === 'month'
            ? MONTHS.get(this['selected-date'].month_name)!.week_names.length
            : 1) * this['cell-height'];
      }
    }
  }

  protected firstUpdated(): void {
    this._body_width = this.renderRoot.firstElementChild?.clientWidth || 0;
    this.renderRoot
      .querySelector('.ht-swipe-calendar__swipe-box')
      ?.addEventListener(
        'transitionend',
        this._after_height_transition.bind(this)
      );
    this.renderRoot
      .querySelector('.ht-swipe-calendar__swipe-slide')
      ?.addEventListener(
        'transitionend',
        this._after_time_transition.bind(this)
      );
  }

  render() {
    // console.log('render swipe box', this.view, this._total_height)
    return html`
      <div
        class="ht-swipe-calendar__swipe-box"
        style="height: ${this._total_height}px;"
      >
        <div
          class="ht-swipe-calendar__swipe-slide"
          style="transform: translateX(calc( -33.3333% + ${this
            ._offset_x}px)) translateY(${this
            ._offset_y}px); transition: transform ${this._no_transition
            ? '0s'
            : '0.3s'}, height 0.3s;"
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      display: flex;
      width: 100%;
    }

    .ht-swipe-calendar__swipe-box {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      transition: height 0.3s;
    }

    .ht-swipe-calendar__swipe-slide {
      width: 300%;
      height: 100%;
      top: 0;
      position: absolute;
      display: flex;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'swipe-box': SwipeBox;
  }
}

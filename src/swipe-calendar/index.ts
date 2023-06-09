import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  DEFAULT_WEEKDAY_NAME,
  date_converter,
  WEEK_CONFIG,
  WEEKS,
  MONTHS,
  next_month,
  next_week,
  prev_week,
  create_date_info,
  BOUNDARY,
  prev_month,
} from '../tools/date';
import { JSON_parse_result } from '../tools/safe-json';
import type { Date_Info, ViewType, WeekStartDay } from '../types';

import { type WeekdayTitle } from './weekday-title';
import './weekday-title';
import { type SwipeBox } from './swipe-box';
import './swipe-box';
import { type DayCell } from './day-cell';
import './day-cell';

const today = new Date();

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
@customElement('swipe-calendar')
export class SwipeCalendar extends LitElement {
  /* #region properties */
  @property({ reflect: true })
  'selected-date' = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  // 日历初始化之后停留在哪个视图
  @property({ reflect: true })
  'view': ViewType = 'month';

  @property({ type: Boolean })
  'no-weekends' = false;

  @property({ type: Boolean })
  'equal-trailing-days' = false;

  @property()
  'max-date'?: string;

  @property()
  'min-date'?: string;

  @property({
    type: Number,
    // 每周开始只能是周日或者周一
    converter(value) {
      return value &&
        ['monday', 'mon', '1', '星期一', '周一', '一', '月曜日', '月'].includes(
          value.toLowerCase()
        )
        ? 1
        : 0;
    },
  })
  'week-start-day': WeekStartDay = 0;

  @property({
    attribute: false,
    converter(value) {
      if (value) {
        const data = JSON_parse_result(value);
        // 如果是json,就检查是否符合要求
        if ('ok' in data && Array.isArray(data.ok) && data.ok.length === 7) {
          return data.ok.map((el: any) => String(el));
        } else {
          // 也允许逗号分隔的七个字符串
          const arr = value.split(',');
          if (arr.length === 7) {
            return arr;
          } else {
            return DEFAULT_WEEKDAY_NAME;
          }
        }
      } else {
        return DEFAULT_WEEKDAY_NAME;
      }
    },
  })
  'weekday-name': string[] = ['日', '一', '二', '三', '四', '五', '六'];

  @property({ type: Number })
  'cell-height' = 38;

  @property()
  'style-cell-title'?: string;

  @property()
  'style-cell-date'?: string;

  @property()
  'style-date-normal'?: string;

  @property()
  'style-date-selected'?: string;

  @property()
  'style-date-today'?: string;

  @property()
  'style-date-disabled'?: string;

  @property()
  'style-date-not-this-month'?: string;

  // 日期过滤函数, 返回true的日期都会
  @property({ attribute: false })
  'filter_hide'?: (date: Date_Info) => boolean;

  // 过滤日期
  @property({ attribute: false })
  'filter_disable'?: (date: Date_Info) => boolean;

  // 左右滑动之后允许设置日期
  @property({ attribute: false })
  'on_swipe'?: (info: {
    view: ViewType;
    range: string[];
  }) => Date;
  /* #endregion */

  /* #region public methods */
  public setDate(date: any) {
    this['selected-date'] = date_converter.from_input(date).date_name;
  }

  public setView(view: 'month' | 'week') {
    this.view = view === 'week' ? 'week' : 'month';
  }

  public toggleViewChange() {
    this._swipe_box?.change_view();
  }
  /* #endregion */

  /* #region private data */
  // 当前选中的日期
  private _selected_date!: Date_Info;
  // 视图展示的前一月(周), 这一月(周), 下一月(周)
  private _showing_times: string[] = [];
  // swipe-box的引用
  private _swipe_box?: SwipeBox;

  /* #endregion */

  /* #region private methods */
  private _on_view_change(e: CustomEvent<ViewType>) {
    this.setView(e.detail);
  }

  private _on_date_change(e: CustomEvent<Date_Info>) {
    console.log('on date change', e.detail);
    this['selected-date'] = e.detail.date_name;
  }

  private _on_click(e: Event) {
    let el = e.target as DayCell;
    // 如果点到date了,就向上使用parentElement获取数据

    if (el && 'date' in el) {
      if (el.disabled) return;
      this['selected-date'] = el.date.date_name;
    }
  }
  /* #endregion */

  /* #region lifecycle methods */
  willUpdate(changedProperties: PropertyValueMap<any>) {
    // 因为切换这两个数据会影响已经缓存的视图,所以每当这两个数据变化时,都要重新生成月份视图
    if (
      changedProperties.has('no-weekends') ||
      changedProperties.has('week-start-day')
    ) {
      // 只允许设置一次
      if (WEEK_CONFIG.week_start_day === undefined) {
        WEEK_CONFIG.no_weekends = this['no-weekends'];
        // 如果设置了no-weekends,就强制设置week-start-day为1
        WEEK_CONFIG.week_start_day = WEEK_CONFIG.no_weekends
          ? 1
          : this['week-start-day'];
      } else {
        console.error('no-weekends or week-start-day can only be set once');
      }
    }

    if (changedProperties.has('max-date') && this['max-date']) {
      const date = new Date(this['max-date']);
      if (date.toString() === 'Invalid Date') {
        console.error('max-date is invalid');
      } else {
        BOUNDARY.max = create_date_info(date);
      }
    }

    if (changedProperties.has('min-date') && this['min-date']) {
      const date = new Date(this['min-date']);
      if (date.toString() === 'Invalid Date') {
        console.error('min-date is invalid');
      } else {
        BOUNDARY.min = create_date_info(date);
      }
    }

    if (changedProperties.has('selected-date')) {
      this._selected_date = date_converter.from_input(this['selected-date']);

      const month = MONTHS.get(this._selected_date.month_name)!;
      const p_month = prev_month(this._selected_date);
      const n_month = next_month(this._selected_date);
      // 向外通报这次日期改变的新信息
      this.dispatchEvent(
        new CustomEvent('date-change', {
          detail: {
            date: this._selected_date,
            view: this.view,
            month: {
              ...month,
              dates: month?.week_names
                .map((week_name) => WEEKS.get(week_name)!.date_names)
                .flat(),
            },
            prev_month_dates: MONTHS.get(p_month)
              ?.week_names.map((week_name) => WEEKS.get(week_name)!.date_names)
              .flat(),
            next_month_dates: MONTHS.get(n_month)
              ?.week_names.map((week_name) => WEEKS.get(week_name)!.date_names)
              .flat(),
            week: WEEKS.get(this._selected_date.week_name)!,
          },
        } as DateChangeEvent)
      );
    }

    if (
      changedProperties.has('selected-date') ||
      changedProperties.has('view')
    ) {
      if (this.view === 'month') {
        this._showing_times = [
          prev_month(this._selected_date),
          this._selected_date.month_name,
          next_month(this._selected_date),
        ];
      } else {
        this._showing_times = [
          prev_week(this._selected_date),
          this._selected_date.week_name,
          next_week(this._selected_date),
        ];
      }
    }
  }

  protected firstUpdated() {
    this._swipe_box = this.renderRoot.querySelector('swipe-box') as SwipeBox;
    console.log(this.renderRoot.querySelector('weekday-title') as WeekdayTitle);
  }

  /* #endregion */

  /* #region render methods */
  render() {
    return html`
      <div class="ht-swipe-calendar">
        <weekday-title
          .no-weekends=${this['no-weekends']}
          .week-start-day=${this['week-start-day']}
          .weekday-name=${this['weekday-name']}
          .style-cell-title=${this['style-cell-title']}
        ></weekday-title>
        <swipe-box
          .cell-height=${this['cell-height']}
          .view=${this.view}
          .selected-date=${this._selected_date}
          .on_swipe=${this.on_swipe}
          @view-change=${this._on_view_change}
          @date-change=${this._on_date_change}
          @click=${this._on_click}
          >${this._showing_times.map(
            (time_name) =>
              html`
                <div
                  class="ht-swipe-calendar__month"
                  time-name=${time_name}
                  time-type=${this.view}
                >
                  ${
                    // 如果是month视图,那么就取出前后三个月的月份数据,每个月包含其中周的名称
                    // 如果是week视图,那么前后三个周的周数据,每个周用数组包裹起来,结构就和月的结构相同
                    (this.view === 'month'
                      ? MONTHS.get(time_name)!.week_names
                      : [time_name]
                    ).map(
                      (week_name) =>
                        html`
                          <div
                            class="ht-swipe-calendar__week"
                            week-name=${week_name}
                          >
                            ${WEEKS.get(week_name)!.date_names.map(
                              (date_name) =>
                                html`<day-cell
                                  date-name=${date_name}
                                  .equal-trailing-days=${this[
                                    'equal-trailing-days'
                                  ]}
                                  .month-name=${this.view === 'month'
                                    ? time_name
                                    : undefined}
                                  .filter_disable=${this.filter_disable}
                                  .filter_hide=${this.filter_hide}
                                  .selected-date=${this._selected_date}
                                  .cell-height=${this['cell-height']}
                                  .style-cell-date=${this['style-cell-date']}
                                  .style-date-normal=${this[
                                    'style-date-normal'
                                  ]}
                                  .style-date-selected=${this[
                                    'style-date-selected'
                                  ]}
                                  .style-date-today=${this['style-date-today']}
                                  .style-date-disabled=${this[
                                    'style-date-disabled'
                                  ]}
                                  .style-date-not-this-month=${this[
                                    'style-date-not-this-month'
                                  ]}
                                  .filter_disable=${this['filter_disable']}
                                  .filter_hide=${this['filter_hide']}
                                ></day-cell>`
                            )}
                          </div>
                        `
                    )
                  }
                </div>
              `
          )}</swipe-box
        >
      </div>
    `;
  }
  /* #endregion */

  /* #region css */
  static styles = css`
    * {
      box-sizing: border-box;
    }

    .ht-swipe-calendar {
      width: 100%;
    }

    .ht-swipe-calendar__month {
      flex: 0 0 calc(100% / 3);
    }

    .ht-swipe-calendar__week {
      display: flex;
    }

    .ht-swipe-calendar__date__hidden {
      flex: 1;
    }
  `;
  /* #endregion */
}

declare global {
  interface HTMLElementTagNameMap {
    'swipe-calendar': SwipeCalendar;
    'swipe-box': SwipeBox;
    'weekday-title': WeekdayTitle;
    'day-cell': DayCell;
  }
}

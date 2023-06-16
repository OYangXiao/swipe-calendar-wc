import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import dayjs from 'dayjs';

import {
  DEFAULT_WEEKDAY_NAME,
  create_date_info,
  date_convert,
} from './tools/date';
import { JSON_parse_result } from './tools/safe-json';
import type { Date_Info, ViewType, WeekStartDay } from '../types';

import { type WeekdayTitle } from './weekday-title';
import './weekday-title';
import { type SwipeBox } from './swipe-box';
import './swipe-box';
import { type DayCell } from './day-cell';
import './day-cell';
import {
  CALENDAR,
  create_months,
  set_boundary_dates,
  set_current_date,
  set_view,
  set_week_config,
} from './calendar';

const MONDAY_TEXT = [
  'monday',
  'mon',
  '1',
  '星期一',
  '周一',
  '一',
  '月曜日',
  '月',
]

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

  @property({ type: Boolean })
  'no-weekends' = false;

  @property({
    // 每周开始只能是周日或者周一
    converter(value) {
      return value &&
        MONDAY_TEXT.includes(value.toLowerCase())
        ? 1
        : 0;
    },
  })
  'week-start-day': WeekStartDay = 0;

  @property()
  'max-date'?: string;

  @property()
  'min-date'?: string;

  @property({ reflect: true })
  'date' = dayjs().format('YYYY-MM-DD');
  // 日历初始化之后停留在哪个视图
  @property({
    reflect: true,
    converter(v) {
      return v === 'week' ? 'week' : 'month';
    },
  })
  'view': ViewType = 'month';

  @property()
  'weekday-name'?: string;

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
  @property({ type: Function })
  'filter_hide'?: (date: Date_Info) => boolean;

  // 过滤日期
  @property({ type: Function })
  'filter_disable'?: (date: Date_Info) => boolean;
  /* #endregion */

  /* #region private methods */
  private _on_view_change(e: CustomEvent<ViewType>) {
    this.view = e.detail;
  }

  private _on_date_change(e: CustomEvent<Date_Info>) {
    console.log('on date change', e.detail);
    this.date = e.detail.date_name;
  }

  private _on_click(e: Event) {
    const el = e.target as DayCell;
    if (el && 'date' in el) {
      if (el.disabled) return;
      this.date = el.date.date_name;
    }
  }
  /* #endregion */

  /* #region lifecycle methods */
  willUpdate(changedProperties: PropertyValueMap<any>) {
    // 因为切换这两个数据会影响已经缓存的视图,所以每当这两个数据变化时,都要重新生成月份视图
    if (
      changedProperties.has('week-start-day') ||
      changedProperties.has('no-weekends')
    ) {
      set_week_config(this['week-start-day'], this['no-weekends']);
    }

    if (changedProperties.has('max-date') && this['max-date']) {
      set_boundary_dates(this['max-date'], 'max');
    }
    if (changedProperties.has('min-date') && this['min-date']) {
      set_boundary_dates(this['min-date'], 'min');
    }

    if (changedProperties.has('date')) {
      const converted_date = date_convert(this.date);
      if (!converted_date) {
        throw new Error('invalid date');
      } else {
        set_current_date(converted_date);
      }
    }

    if (changedProperties.has('view')) {
      set_view(this.view);
    }
  }

  /* #endregion */

  /* #region render methods */
  render() {
    return html`
      <div class="ht-swipe-calendar">
        <weekday-title
          weekday-name=${this['weekday-name']}
          .style-cell-title=${this['style-cell-title']}
        ></weekday-title>
        <swipe-box
          .cell-height=${this['cell-height']}
          view=${this.view}
          date=${this.date}
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
                    time_name
                      ? (this.view === 'month'
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
                                      .month-name=${this.view === 'month' &&
                                      time_name}
                                      .filter_disable=${this.filter_disable}
                                      .filter_hide=${this.filter_hide}
                                      .selected-date=${this._selected_date}
                                      .cell-height=${this['cell-height']}
                                      .style-cell-date=${this[
                                        'style-cell-date'
                                      ]}
                                      .style-date-normal=${this[
                                        'style-date-normal'
                                      ]}
                                      .style-date-selected=${this[
                                        'style-date-selected'
                                      ]}
                                      .style-date-today=${this[
                                        'style-date-today'
                                      ]}
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
                      : html`<div class="ht-swipe-calendar__empty-time"></div>`
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

(window as any).SwipeCalendar = SwipeCalendar;

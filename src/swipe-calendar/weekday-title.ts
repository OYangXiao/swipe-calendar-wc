import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { JSON_parse_result } from './tools/safe-json';
import { CALENDAR } from './calendar';

const DEFAULT_WEEKDAY_NAME = ['日', '一', '二', '三', '四', '五', '六'];

@customElement('weekday-title')
export class WeekdayTitle extends LitElement {
  @property({
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
  'weekday-name' = DEFAULT_WEEKDAY_NAME;

  @property()
  'style-cell-title'?: string;

  render() {
    let weekdays =
      CALENDAR.week_start_day === 1
        ? [1, 2, 3, 4, 5, 6, 0]
        : [0, 1, 2, 3, 4, 5, 6];
    if (CALENDAR.no_weekends) {
      weekdays = weekdays.filter((day) => day !== 0 && day !== 6);
    }

    return html`
      <div class="ht-swipe-calendar__week">
        ${weekdays.map(
          (day) =>
            html`<div
              class="ht-swipe-calendar__cell__title"
              style="${this['style-cell-title']}"
            >
              ${this['weekday-name'][day]}
            </div>`
        )}
      </div>
    `;
  }
  static styles = css`
    * {
      box-sizing: border-box;
    }

    .ht-swipe-calendar__week {
      display: flex;
    }

    .ht-swipe-calendar__cell__title {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 21px;
      line-height: 17px;
      font-size: 15px;
      font-weight: 500;
      color: #e3e8ed;
      padding: 2px 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'weekday-title': WeekdayTitle;
  }
}

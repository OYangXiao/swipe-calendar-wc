import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { WeekStartDay } from '../types';
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('weekday-title')
export class WeekdayTitle extends LitElement {
  @property({ type: Boolean })
  'no-weekends'!: boolean;

  @property({ type: Number })
  'week-start-day'!: WeekStartDay;

  @property({ type: Object })
  'weekday-name'!: string[];

  @property()
  'style-cell-title'?: string;

  private _weekdays: number[] = [];

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has('no-weekends') || _changedProperties.has('week-start-day')) {
      this._weekdays = this['week-start-day'] === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];

      if (this['no-weekends']) {
        this._weekdays = this._weekdays.filter(day => day !== 0 && day !== 6);
      }
    }
  }

  render() {
    return html`
      <div class="ht-swipe-calendar__week">
        ${this._weekdays.map(
          day =>
            html`<div class="ht-swipe-calendar__cell__title" style="${this['style-cell-title']}">
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

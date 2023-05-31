import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { combine_attr } from '../tools/combine-attr';
import { DATES } from '../tools/date';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('day-cell')
export class DayCell extends LitElement {
  @property()
  'date-name'!: string;

  @property()
  'month-name'?: string;

  @property({ type: Object })
  'selected-date'!: Date_Info;

  @property({ type: Number })
  'cell-height'!: number;

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

  @property()
  'style-cell-title'?: string;

  @property({ type: Function })
  filter_disable?: (date: Date_Info) => boolean;

  @property({ type: Function })
  filter_hide?: (date: Date_Info) => boolean;

  private _is_today = false;
  private _date!: Date_Info;
  private _is_selected = false;
  private _is_hidden = false;
  private _is_disabled = false;
  private _not_this_month = false;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has('date-name')) {
      this._date = DATES.get(this['date-name'])!;

      const today = new Date();
      const today_date_name = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDate()}`;

      this._is_today = this._date.date_name === today_date_name;
      this._is_hidden = this.filter_hide?.(this._date) ?? false;
      this._is_disabled = this.filter_disable?.(this._date) ?? false;
      this._not_this_month = !!this['month-name'] && this._date.month_name !== this['month-name'];
    }

    if (
      _changedProperties.has('date-name') ||
      _changedProperties.has('selected-date')
    ) {
      this._is_selected = this._date === this['selected-date'];
    }
  }

  render() {
    if (this._is_hidden) {
      return;
    }

    return html`<div
      class="ht-swipe-calendar__cell ht-swipe-calendar__cell_date "
      style="${this['style-cell-date']} height: ${this['cell-height']}px;"
    >
      <div
        class="${combine_attr([
          'ht-swipe-calendar__date',
          this._not_this_month && 'ht-swipe-calendar__date__not-this-month',
          this._is_today && 'ht-swipe-calendar__date__today',
          this._is_selected && 'ht-swipe-calendar__date__selected',
          this._is_disabled && 'ht-swipe-calendar__date__disabled',
        ])}"
        style="${combine_attr([
          this['style-date-normal'],
          this._not_this_month && this['style-date-not-this-month'],
          this._is_today && this['style-date-today'],
          this._is_selected && this['style-date-selected'],
          this._is_disabled && this['style-date-disabled'],
        ])}"
      >
        ${this._date.date} <span style="color:white;font-size:9px;margin-left: 6px;">${this._date.week_index}</span>
      </div>
    </div>`;
  }
  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      flex: 1;
    }

    .ht-swipe-calendar__cell {
      flex: 1;
      font-weight: 400;
      font-size: 16px;
      padding: 3px 0 2px 0;
      color: #e3e8ed;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ht-swipe-calendar__date {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 33px;
      height: 33px;
      position: relative;
    }

    .ht-swipe-calendar__date__selected {
      border-radius: 50%;
      background-color: #d53630;
    }

    .ht-swipe-calendar__date__disabled,
    .ht-swipe-calendar__date__not-this-month {
      color: grey;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'day-cell': DayCell;
  }
}

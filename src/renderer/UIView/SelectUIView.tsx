import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import SelectUIModel from '../UIModel/SelectUIModel';

export default class SelectUIView extends UIViewBase<SelectUIModel, UIViewBaseProps<SelectUIModel>, UIViewBaseState> {
  private _select: HTMLSelectElement;
  render(): React.ReactNode {
    const { model, collectValue } = this.props;
    return (
      <select
        onChange={this.onUpdate}
        ref={ref => this._select = ref!}
        value={model.value}
      >
        {model.options(collectValue).map(option => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  constructor(props: UIViewBaseProps<SelectUIModel>, context?: any) {
    super(props, context);
    this.onUpdate = this.onUpdate.bind(this);
  }

  private onUpdate(): void {
    this.props.applyAction(this.props.model.input(this._select.value));
  }
}
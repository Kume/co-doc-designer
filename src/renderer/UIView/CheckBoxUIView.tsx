import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import CheckBoxUIModel from '../UIModel/CheckBoxUIModel';

export default class CheckBoxUIView
  extends UIViewBase<CheckBoxUIModel, UIViewBaseProps<CheckBoxUIModel>, UIViewBaseState> {
  private _checkboxInput: HTMLInputElement;
  render(): React.ReactNode {
    return (
      <input
        type="checkbox"
        checked={this.props.model.isChecked}
        onChange={this.onUpdate}
        ref={ref => this._checkboxInput = ref!}
      />
    );
  }

  constructor(props: UIViewBaseProps<CheckBoxUIModel>, context?: any) {
    super(props, context);

    this.onUpdate = this.onUpdate.bind(this);
  }

  private onUpdate(): void {
    this.props.applyAction(this.props.model.input(this._checkboxInput.checked));
  }
}

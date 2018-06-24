import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import CheckBoxUIModel2 from '../UIModel2/CheckBoxUIModel2';

export default class CheckBoxUIView
  extends UIViewBase<CheckBoxUIModel2, UIViewBaseProps<CheckBoxUIModel2>, UIViewBaseState> {
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

  constructor(props: UIViewBaseProps<CheckBoxUIModel2>, context?: any) {
    super(props, context);

    this.onUpdate = this.onUpdate.bind(this);
  }

  private onUpdate(): void {
    this.props.applyAction(this.props.model.input(this._checkboxInput.checked));
  }
}

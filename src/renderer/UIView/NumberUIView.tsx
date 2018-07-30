import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import NumberUIModel from '../UIModel/NumberUIModel';

export default class NumberUIView extends UIViewBase<NumberUIModel, UIViewBaseProps<NumberUIModel>, UIViewBaseState> {
  private _textInput: HTMLInputElement;

  constructor(props: UIViewBaseProps<NumberUIModel>) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render(): React.ReactNode {
    const { model } = this.props;
    return (
      <input
        type="text"
        onChange={this.onChange}
        value={model.number}
        ref={ref => this._textInput = ref!}
      />
    );
  }

  private onChange() {
    const { model, applyAction } = this.props;
    applyAction(model.input(this._textInput.value));
  }
}
import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextUIModel from '../UIModel/TextUIModel';

export default class TextUIView extends UIViewBase<TextUIModel, UIViewBaseProps<TextUIModel>, UIViewBaseState> {
  private _textInput: HTMLInputElement;

  render(): React.ReactNode {
    const model = this.props.model;
    return (
      <input
        type="text"
        value={model.text}
        onChange={() => this.props.applyAction(model.input(this._textInput.value))}
        ref={ref => this._textInput = ref!}
      />
    );
  }
}

import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextUIModel2 from '../UIModel2/TextUIModel2';

export default class TextUIView extends UIViewBase<TextUIModel2, UIViewBaseProps<TextUIModel2>, UIViewBaseState> {
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

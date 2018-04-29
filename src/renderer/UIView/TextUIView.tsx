import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextUIModel from '../UIModel/TextUIModel';

interface Props extends UIViewBaseProps {
  model: TextUIModel;
}

export default class TextUIView extends UIViewBase<Props, UIViewBaseState> {
  private _textInput: HTMLInputElement;

  render(): React.ReactNode {
    return (
      <input
        type="text"
        value={this.props.model.text}
        onChange={() => this.props.model.inputText(this.props.dispatch, this._textInput.value)}
        ref={ref => this._textInput = ref!}
      />
    );
  }
}

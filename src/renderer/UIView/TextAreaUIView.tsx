import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextAreaUIModel from '../UIModel/TextAreaUIModel';

interface Props extends UIViewBaseProps {
  model: TextAreaUIModel;
}

export default class TextAreaUIView extends UIViewBase<Props, UIViewBaseState> {
  private _textArea: HTMLTextAreaElement;

  render(): React.ReactNode {
    return (
      <textarea
        value={this.props.model.text}
        onChange={() => this.props.model.inputText(this.props.dispatch, this._textArea.value)}
        ref={ref => this._textArea = ref!}
        rows={5}
      />
    );
  }
}
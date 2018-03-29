import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextUIModel from '../UIModel/TextUIModel';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/DataPath';

interface Props extends UIViewBaseProps {
  model: TextUIModel;
  data: ScalarDataModel;
}

export default class TextUIView extends UIViewBase<Props, UIViewBaseState> {
  private _textInput: HTMLInputElement;

  render(): React.ReactNode {
    const { data } = this.props;
    return (
      <input
        type="text"
        value={data && data.value}
        onChange={() => this._update()}
        ref={ref => this._textInput = ref!}
      />
    );
  }

  private _update(): void {
    this.props.onUpdate(
      new DataPath([]),
      new ScalarDataModel(this._textInput.value));
  }
}
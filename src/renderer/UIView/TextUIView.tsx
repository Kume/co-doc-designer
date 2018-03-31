import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import { StringDataModel } from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/DataPath';

interface Props extends UIViewBaseProps {
  model: TextUIDefinition;
  data: StringDataModel;
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
      new StringDataModel(this._textInput.value));
  }
}

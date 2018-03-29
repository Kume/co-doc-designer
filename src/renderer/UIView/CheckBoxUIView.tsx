import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import CheckBoxUIModel from '../UIModel/CheckBoxUIModel';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/DataPath';

interface Props extends UIViewBaseProps {
  model: CheckBoxUIModel;
  data: ScalarDataModel;
}

export default class CheckBoxUIView extends UIViewBase<Props, UIViewBaseState> {
  private _checkboxInput: HTMLInputElement;
  render(): React.ReactNode {
    return (
      <input
        type="checkbox"
        defaultValue={this.props.data.value}
        onChange={() => this._update()}
        ref={ref => this._checkboxInput = ref!}
      />
    );
  }

  private _update(): void {
    this.props.onUpdate(
      new DataPath([]),
      new ScalarDataModel(this._checkboxInput.value));
  }
}

import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import ScalarDataModel, { BooleanDataModel } from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/DataPath';

interface Props extends UIViewBaseProps {
  model: CheckBoxUIDefinition;
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
      new BooleanDataModel(!!this._checkboxInput.value));
  }
}

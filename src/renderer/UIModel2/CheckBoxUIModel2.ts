import UIModel2  from './UIModel2';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import { BooleanDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModel2Actions';

export default class CheckBoxUIModel2 extends UIModel2<CheckBoxUIDefinition> {
  public get isChecked(): boolean {
    const data = this.props.data;
    if (data instanceof BooleanDataModel) {
      return data.value;
    } else {
      return false;
    }
  }

  public input(isChecked: boolean): UIModelAction[] {
    console.log({isChecked});
    if (this.isChecked === isChecked) {
      return [];
    } else {
      return [UIModelAction.Creators.setData(this.props.dataPath, BooleanDataModel.create(isChecked))];
    }
  }
}
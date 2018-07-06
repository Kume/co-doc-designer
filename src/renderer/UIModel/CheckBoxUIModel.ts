import UIModel  from './UIModel';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import { BooleanDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModelActions';

const trueStrings = ['true', 'True', 'TRUE', 'ok', 'OK', 'Ok', 'yes', 'Yes', 'YES'];
const falseStrings = ['false', 'False', 'FALSE', 'ng', 'Ng', 'NG', 'no', 'No', 'NO'];
const booleanStrings: Array<string> = trueStrings.concat(falseStrings);

export default class CheckBoxUIModel extends UIModel<CheckBoxUIDefinition> {
  public get isChecked(): boolean {
    const data = this.props.data;
    if (data instanceof BooleanDataModel) {
      return data.value;
    } else {
      return false;
    }
  }

  public static canInputValue(value: any): value is string | boolean {
    if (typeof value === 'boolean') { return true; }
    if (typeof value === 'string') { return booleanStrings.includes(value); }
    return false;
  }

  public input(isChecked: string | boolean): UIModelAction[] {
    if (typeof isChecked === 'string') {
      isChecked = trueStrings.includes(isChecked);
    }
    if (this.isChecked === isChecked) {
      return [];
    } else {
      return [UIModelAction.Creators.setData(this.props.dataPath, BooleanDataModel.create(isChecked))];
    }
  }
}
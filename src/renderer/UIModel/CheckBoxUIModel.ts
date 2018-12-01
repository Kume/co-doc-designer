import UIModel  from './UIModel';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import { BooleanDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModelActions';
import DataPath from '../DataModel/Path/DataPath';

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

  public static input(definition: CheckBoxUIDefinition, dataPath: DataPath, value: string | boolean): UIModelAction[] {
    if (typeof value === 'string') {
      value = trueStrings.includes(value);
    }
    return [UIModelAction.Creators.setData(dataPath, BooleanDataModel.create(value))];
  }

  public input(isChecked: string | boolean): UIModelAction[] {
    if (typeof isChecked === 'string') {
      isChecked = trueStrings.includes(isChecked);
    }
    if (this.isChecked === isChecked) {
      return [];
    } else {
      return CheckBoxUIModel.input(this.definition, this.props.dataPath, isChecked);
    }
  }
}
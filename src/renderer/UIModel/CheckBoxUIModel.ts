import { Record } from "immutable";
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from "./UIModel";
import DataPath from "../DataModel/DataPath";
import EditContext from "./EditContext";
import DataModelBase from "../DataModel/DataModelBase";
import CheckBoxUIDefinition from "../UIDefinition/CheckBoxUIDefinition";
import { createSetValueAction } from "./UIModelAction";
import { BooleanDataModel } from "../DataModel/ScalarDataModel";

const CheckBoxUIModelRecord = Record({
  ...UIModelPropsDefault
});

const trueStrings = ['true', 'True', 'TRUE', 'ok', 'OK', 'Ok', 'yes', 'Yes', 'YES'];
const falseStrings = ['false', 'False', 'FALSE', 'ng', 'Ng', 'NG', 'no', 'No', 'NO'];
const booleanStrings: Array<string> = trueStrings.concat(falseStrings);

export default class CheckBoxUIModel extends CheckBoxUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: CheckBoxUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;

  constructor(props: UIModelProps) {
    super({
      ...props
    });
  }

  public get isChecked(): boolean {
    if (this.data instanceof BooleanDataModel) {
      return this.data.value;
    }
    return false;
  }

  public check(dispatch: ActionDispatch, isChecked: boolean): void {
    dispatch(createSetValueAction(this.dataPath, new BooleanDataModel(isChecked)));
  }

  public canInputValue(value: any): boolean {
    if (typeof value === 'boolean') { return true; }
    if (typeof value === 'string') { return booleanStrings.includes(value); }
    return false;
  }

  public inputValue(dispatch: ActionDispatch, value: any) {
    if (typeof value === 'boolean') {
      dispatch(createSetValueAction(this.dataPath, new BooleanDataModel(value)));
    }
    if (typeof value === 'string') {
      if (trueStrings.includes(value)) {
        dispatch(createSetValueAction(this.dataPath, new BooleanDataModel(true)));
      } else if (falseStrings.includes(value)) {
        dispatch(createSetValueAction(this.dataPath, new BooleanDataModel(false)));
      } else {
        throw new Error();
      }
    }
  }

  public get propsObject(): UIModelProps {
    return {
      definition: this.definition,
      dataPath: this.dataPath,
      data: this.data,
      editContext: this.editContext
    }
  }

  updateData(data: DataModelBase | undefined): this {
    return this.set('data', data) as this;
  }

  updateEditContext(editContext: EditContext): this {
    return this.set('editContext', editContext) as this;
  }
}
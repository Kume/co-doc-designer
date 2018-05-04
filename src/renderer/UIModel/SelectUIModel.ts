import { Record } from 'immutable';
import UIModel, { ActionDispatch, CollectValue, UIModelProps, UIModelPropsDefault } from './UIModel';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import DataModelBase from '../DataModel/DataModelBase';
import SelectUIDefinition, { SelectOption } from '../UIDefinition/SelectUIDefinition';
import UIModelState from './UIModelState';
import { createSetValueAction } from './UIModelAction';
import DataModelFactory from '../DataModel/DataModelFactory';
import { NumberDataModel, StringDataModel } from '../DataModel/ScalarDataModel';

interface SelectUIModelState extends UIModelState {

}

const SelectUIModelRecord = Record({
  ...UIModelPropsDefault
});

export default class SelectUIModel extends SelectUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: SelectUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;

  //#region private static function for props
  //#endregion

  public constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({
      ...props
    });
  }

  public get value(): string | number | undefined {
    if (this.data instanceof StringDataModel) {
      return this.data.value;
    } else if (this.data instanceof NumberDataModel) {
      return this.data.value;
    } else {
      return undefined;
    }
  }

  public options(collectValue: CollectValue): SelectOption[] {
    if (this.definition.staticOptions) {
      return this.definition.staticOptions;
    } else if (this.definition.dynamicOptions) {
      return collectValue(this.definition.dynamicOptions.path, this.dataPath).map(value => {
        if (value instanceof NumberDataModel) {
          return { label: value.value.toString(), value: value.value };
        } else if (value instanceof StringDataModel) {
          return { label: value.value, value: value.value };
        } else {
          throw new Error();
        }
      });
    }
    return [];
  }

  //#region manipulation
  public inputValue(dispatch: ActionDispatch, value: string | number): void {
    dispatch(createSetValueAction(this.dataPath, DataModelFactory.create(value)));
  }
  //#endregion

  //#region implementation for UIModel
  public updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    return this.set('data', data) as this;
  }

  public updateEditContext(editContext: EditContext, lastState: UIModelState | undefined): this {
    return this.set('editContext', editContext) as this;
  }

  public getState(lastState: UIModelState | undefined): SelectUIModelState | undefined {
    return undefined;
  }
  //#endregion
}
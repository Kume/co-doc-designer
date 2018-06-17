import { Record } from 'immutable';
import UIModel, {
  ActionDispatch,
  CollectValue,
  UIModelProps,
  UIModelPropsDefault,
  UpdateUIModelParams
} from './UIModel';
import DataPath from '../DataModel/Path/DataPath';
import EditContext from './EditContext';
import DataModelBase, { DataCollectionElement } from '../DataModel/DataModelBase';
import SelectUIDefinition, { SelectOption, SelectUIDynamicOptions } from '../UIDefinition/SelectUIDefinition';
import UIModelState from './UIModelState';
import { createSetValueAction } from './UIModelAction';
import DataModelFactory from '../DataModel/DataModelFactory';
import { NullDataModel, NumberDataModel, StringDataModel } from '../DataModel/ScalarDataModel';

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

  private static _toOptionValue(data: DataModelBase | undefined): string | number {
    if (data instanceof NumberDataModel) {
      return data.value;
    } else if (data instanceof StringDataModel) {
      return data.value;
    } else if (data) {
      return data.toString();
    } else {
      return "";
    }
  }

  private static _toSelectOption(data: DataCollectionElement, options: SelectUIDynamicOptions): SelectOption {
    const labelData = options.labelPath ? DataCollectionElement.getValue(data, options.labelPath) : data.data;
    const valueData = options.valuePath ? DataCollectionElement.getValue(data, options.valuePath) : data.data;
    return {
      label: labelData ? labelData.toString() : "",
      value: SelectUIModel._toOptionValue(valueData)
    };
  }

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

  public labelForValue(collectValue: CollectValue, value: any): string {
    const options = this.options(collectValue);
    const option = options.find(option => option!.value === value);
    console.log('labelForValue', {options, option, value});
    return option ? option.label : "";
  }

  public options(collectValue: CollectValue): SelectOption[] {
    if (this.definition.staticOptions) {
      return this.definition.staticOptions;
    }
    const dynamicOptions = this.definition.dynamicOptions;
    if (dynamicOptions) {
      return collectValue(dynamicOptions.path, this.dataPath)
        .map(value => SelectUIModel._toSelectOption(value, dynamicOptions));
    }
    return [];
  }

  //#region manipulation
  public inputValue(dispatch: ActionDispatch, value: string | number): void {
    dispatch(createSetValueAction(this.dataPath, DataModelFactory.create(value)));
  }

  public inputLabel(dispatch: ActionDispatch, collectValue: CollectValue, label: string): void {
    const matchOption = this.options(collectValue).find(option => option.label === label);
    const value = matchOption ? DataModelFactory.create(matchOption.value) : NullDataModel.null;
    console.log('inputLabel', {label, value});
    dispatch(createSetValueAction(this.dataPath, value));
  }
  //#endregion

  //#region implementation for UIModel
  public updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    return this.set('data', data) as this;
  }

  public updateEditContext(editContext: EditContext | undefined, lastState: UIModelState | undefined): this {
    return this.set('editContext', editContext) as this;
  }

  updateModel(params: UpdateUIModelParams): this {
    let newModel: this = params.dataPath ? this.set('dataPath', params.dataPath.value) as this : this;
    newModel = params.data ? this.updateData(params.data.value, params.lastState) : newModel;
    newModel = params.editContext ? this.updateEditContext(params.editContext.value, params.lastState) : newModel;
    return newModel;
  }

  public getState(lastState: UIModelState | undefined): SelectUIModelState | undefined {
    return undefined;
  }
  //#endregion

}
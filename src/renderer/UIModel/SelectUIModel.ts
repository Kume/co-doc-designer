import UIModel  from './UIModel';
import { is } from 'immutable';
import SelectUIDefinition, { SelectOption, SelectUIDynamicOptions } from '../UIDefinition/SelectUIDefinition';
import { NullDataModel, NumberDataModel, StringDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModelActions';
import DataModelFactory from '../DataModel/DataModelFactory';
import { CollectValue } from './types';
import { DataCollectionElement } from '../DataModel/DataModelBase';
import DataModelBase from '../DataModel/DataModelBase';

export default class SelectUIModel extends UIModel<SelectUIDefinition> {
  private static _toSelectOption(data: DataCollectionElement, options: SelectUIDynamicOptions): SelectOption {
    const labelData = options.labelPath ? DataCollectionElement.getValue(data, options.labelPath) : data.data;
    const valueData = options.valuePath ? DataCollectionElement.getValue(data, options.valuePath) : data.data;
    return {
      label: labelData ? labelData.toString() : '',
      value: SelectUIModel._toOptionValue(valueData)
    };
  }

  private static _toOptionValue(data: DataModelBase | undefined): string | number {
    if (data instanceof NumberDataModel || data instanceof StringDataModel) {
      return data.value;
    } else if (data) {
      return data.toString();
    } else {
      return '';
    }
  }

  public get value(): string | number | undefined {
    const data = this.props.data;
    if (data instanceof StringDataModel) {
      return data.value;
    } else if (data instanceof NumberDataModel) {
      return data.value;
    } else {
      return undefined;
    }
  }

  public labelForValue(collectValue: CollectValue, value: any): string {
    const options = this.options(collectValue);
    const optionForValue = options.find(option => option!.value === value);
    return optionForValue ? optionForValue.label : '';
  }

  public options(collectValue: CollectValue): SelectOption[] {
    if (this.definition.staticOptions) {
      return this.definition.staticOptions;
    }
    const dynamicOptions = this.definition.dynamicOptions;
    if (dynamicOptions) {
      return collectValue(dynamicOptions.path, this.props.dataPath)
        .map(value => SelectUIModel._toSelectOption(value, dynamicOptions));
    }
    return [];
  }

  public input(value: string | number | undefined): UIModelAction[] {
    if (this.value === value) {
      return [];
    } else {
      return [UIModelAction.Creators.setData(this.props.dataPath, DataModelFactory.create(value))];
    }
  }

  public inputLabel(label: string, collectValue: CollectValue): UIModelAction[] {
    const matchOption = this.options(collectValue).find(option => option.label === label);
    const value = matchOption ? DataModelFactory.create(matchOption.value) : NullDataModel.null;
    if (is(value, this.props.data)) {
      return [];
    } else {
      return [UIModelAction.Creators.setData(this.props.dataPath, value)];
    }
  }
}
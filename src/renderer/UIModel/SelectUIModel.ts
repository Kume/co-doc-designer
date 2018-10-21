import UIModel  from './UIModel';
import { is } from 'immutable';
import * as _ from 'underscore';
import SelectUIDefinition from '../UIDefinition/SelectUIDefinition';
import { NullDataModel, NumberDataModel, StringDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModelActions';
import DataModelFactory from '../DataModel/DataModelFactory';
import { CollectValue } from './types';
import { DataCollectionElement } from '../DataModel/DataModelBase';
import DataModelBase from '../DataModel/DataModelBase';
import ListDataModel from '../DataModel/ListDataModel';
import { isDynamicOption, SelectDynamicOption, SelectOption, SelectOptionConfig } from '../common/commonConfig';

export default class SelectUIModel extends UIModel<SelectUIDefinition> {
  private static _toSelectOption(data: DataCollectionElement, options: SelectDynamicOption): SelectOption {
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

  private static toValue(data: DataModelBase | undefined): string | number | null {
    if (data instanceof StringDataModel) {
      return data.value;
    } else if (data instanceof NumberDataModel) {
      return data.value;
    } else {
      return null;
    }
  }

  public get value(): string | number | (string | number)[] | null {
    const data = this.props.data;
    if (this.definition.isMulti) {
      if (data instanceof ListDataModel) {
        return data
          .mapDataWithIndex(item => SelectUIModel.toValue(item))
          .filter(item => item !== undefined) as (string | number)[];
      } else {
        return [];
      }
    } else {
      return SelectUIModel.toValue(data);
    }
  }

  public labelForValue(collectValue: CollectValue, value: any): string {
    const options = this.options(collectValue);
    const optionForValue = options.find(option => option!.value === value);
    return optionForValue ? optionForValue.label : '';
  }

  public options(collectValue: CollectValue): SelectOptionConfig[] {
    let addedValues: Set<string | number> = new Set();
    let options: SelectOptionConfig[] = [];
    for (const option of this.definition.options) {
      if (isDynamicOption(option)) {
        collectValue(option.path, this.props.dataPath)
          .forEach(value => {
            const formattedOption = SelectUIModel._toSelectOption(value, option);
            if (!addedValues.has(formattedOption.value)) {
              options.push(formattedOption);
              addedValues.add(formattedOption.value);
            }
          });
      } else {
        if (!addedValues.has(option.value)) {
          options.push(option);
          addedValues.add(option.value);
        }
      }
    }
    return options;
  }

  public input(value: string | number | undefined | null | any[]): UIModelAction[] {
    if (this.definition.isMulti) {
      if (!Array.isArray(value) || _.isEqual(this.value, value)) {
        return [];
      } else {
        return [UIModelAction.Creators.setData(this.props.dataPath, DataModelFactory.create(value))];
      }
    } else {
      if (this.value === value) {
        return [];
      } else {
        return [UIModelAction.Creators.setData(this.props.dataPath, DataModelFactory.create(value))];
      }
    }
  }

  public inputLabel(label: string | string[], collectValue: CollectValue): UIModelAction[] {
    if (this.definition.isMulti) {
      if (Array.isArray(label)) {
        const values = DataModelFactory.create(label.map(
          labelItem => this.valueForLabel(labelItem, collectValue)));
        return [UIModelAction.Creators.setData(this.props.dataPath, values)];
      } else {
        return [UIModelAction.Creators.setData(this.props.dataPath, NullDataModel.null)];
      }
    } else {
      const value = typeof label === 'string' ? this.valueForLabel(label, collectValue) : NullDataModel.null;
      if (is(value, this.props.data)) {
        return [];
      } else {
        return [UIModelAction.Creators.setData(this.props.dataPath, value)];
      }
    }
  }

  private valueForLabel(label: string, collectValue: CollectValue): DataModelBase {
    const matchOption = this.options(collectValue).find(option => option.label === label);
    return matchOption ? DataModelFactory.create(matchOption.value) : NullDataModel.null;
  }
}
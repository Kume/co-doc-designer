import NumberUIDefinition from '../UIDefinition/NumberUIDefinition';
import UIModel from './UIModel';
import { UIModelAction } from './UIModelActions';
import { NumberDataModel, StringDataModel } from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/Path/DataPath';

export default class NumberUIModel extends UIModel<NumberUIDefinition> {
  public static canInputValue(value: any): value is string | undefined {
    return typeof value === 'string' || typeof value === 'number';
  }

  public static input(definition: NumberUIDefinition, dataPath: DataPath, value: string | undefined): UIModelAction[] {
    if (value === undefined) {
      return [UIModelAction.Creators.deleteData(dataPath)];
    } else {
      try {
        const parsed = Number.parseFloat(value);
        return [UIModelAction.Creators.setData(dataPath, NumberDataModel.create(parsed))];
      } catch {
        return [UIModelAction.Creators.setData(dataPath, StringDataModel.create(value))];
      }
    }
  }

  public get number(): string {
    const { data } = this.props;
    if (data instanceof NumberDataModel) {
      return data.value.toString();
    } else if (data instanceof StringDataModel) {
      return data.value;
    }
    return '';
  }

  public input(value: string | undefined): UIModelAction[] {
    if (this.number === value) {
      return [];
    } else {
      return NumberUIModel.input(this.definition, this.props.dataPath, value);
    }
  }
}
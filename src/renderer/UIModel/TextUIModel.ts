import UIModel  from './UIModel';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import { StringDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModelActions';
import DataPath from '../DataModel/Path/DataPath';

export default class TextUIModel extends UIModel<TextUIDefinition> {
  public static canInput(value: any): value is string | undefined {
    return value === undefined || typeof value === 'string';
  }

  public static input(definition: TextUIDefinition, dataPath: DataPath, value: string | undefined): UIModelAction[] {
    if (value === undefined) {
      return [UIModelAction.Creators.deleteData(dataPath)];
    } else {
      return [UIModelAction.Creators.setData(dataPath, StringDataModel.create(value))];
    }
  }

  public get text(): string {
    const data = this.props.data;
    if (data instanceof StringDataModel) {
      return data.value;
    } else {
      return '';
    }
  }

  public input(value: string): UIModelAction[] {
    if (this.text === value) {
      return [];
    } else {
      return TextUIModel.input(this.definition, this.props.dataPath, value);
    }
  }
}

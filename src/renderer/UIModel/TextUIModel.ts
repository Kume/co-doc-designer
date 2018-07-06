import UIModel  from './UIModel';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import { StringDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModelActions';

export default class TextUIModel extends UIModel<TextUIDefinition> {
  public get text(): string {
    const data = this.props.data;
    if (data instanceof StringDataModel) {
      return data.value;
    } else {
      return '';
    }
  }

  public input(text: string): UIModelAction[] {
    if (this.text === text) {
      return [];
    } else {
      return [UIModelAction.Creators.setData(this.props.dataPath, StringDataModel.create(text))];
    }
  }
}

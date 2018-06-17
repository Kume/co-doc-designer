import UIModel2  from './UIModel2';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import { StringDataModel } from '../DataModel/ScalarDataModel';
import { UIModelAction } from './UIModel2Actions';

export default class TextUIModel2 extends UIModel2<TextUIDefinition> {
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
      return [UIModelAction.Creators.setData(this.props.path, StringDataModel.create(text))];
    }
  }
}

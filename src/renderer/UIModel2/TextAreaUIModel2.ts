import UIModel2 from './UIModel2';
import TextAreaUIDefinition from '../UIDefinition/TextAreaUIDefinition';
import { UIModelAction } from './UIModel2Actions';
import { StringDataModel } from '../DataModel/ScalarDataModel';

export default class TextAreaUIModel2 extends UIModel2<TextAreaUIDefinition> {
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
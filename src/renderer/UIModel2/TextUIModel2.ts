import UIModel2, { UIModel2Props } from './UIModel2';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import { StringDataModel } from '../DataModel/ScalarDataModel';

export default class TextUIModel2 extends UIModel2<TextUIDefinition> {
  public get text(): string {
    const data = this.props.data;
    if (data instanceof StringDataModel) {
      return data.value;
    } else {
      return '';
    }
  }

  public input(text: string): void {

  }

  update(props: UIModel2Props): TextUIModel2 {
    return new TextUIModel2(this._definition, props);
  }
}

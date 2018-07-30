import NumberUIDefinition from '../UIDefinition/NumberUIDefinition';
import UIModel from './UIModel';
import { UIModelAction } from './UIModelActions';
import { NumberDataModel, StringDataModel } from '../DataModel/ScalarDataModel';

export default class NumberUIModel extends UIModel<NumberUIDefinition> {
  public get number(): string {
    const { data } = this.props;
    if (data instanceof NumberDataModel) {
      return data.value.toString();
    } else if (data instanceof StringDataModel) {
      return data.value;
    }
    return '';
  }

  public input(num: string | undefined): UIModelAction[] {
    if (this.number === num) {
      return [];
    } else {
      if (num === undefined) {
        return [UIModelAction.Creators.deleteData(this.props.dataPath)];
      } else {
        try {
          const parsed = Number.parseFloat(num);
          return [UIModelAction.Creators.setData(this.props.dataPath, NumberDataModel.create(parsed))];
        } catch {
          return [UIModelAction.Creators.setData(this.props.dataPath, StringDataModel.create(num))];
        }
      }
    }
  }
}
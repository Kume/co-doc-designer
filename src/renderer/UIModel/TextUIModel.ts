import { Record } from 'immutable';
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault, UpdateUIModelParams } from './UIModel';
import { StringDataModel } from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/Path/DataPath';
import DataModelBase from '../DataModel/DataModelBase';
import EditContext from './EditContext';
import { createSetValueAction } from './UIModelAction';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import UIModelState from './UIModelState';

const TextUIModelRecord = Record({
  ...UIModelPropsDefault,
});

export default class TextUIModel extends TextUIModelRecord implements UIModel {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TextUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;

  public constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({ ...props });
  }

  public get text(): string {
    const data = this.data;
    if (data instanceof StringDataModel) {
      return data.value;
    } else {
      return '';
    }
  }

  public inputText(dispatch: ActionDispatch, text: string): void {
    dispatch(createSetValueAction(this.dataPath, new StringDataModel(text)));
  }

  updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    return this.set('data', data) as this;
  }

  updateEditContext(editContext: EditContext | undefined, lastState: UIModelState | undefined): this {
    return this.set('editContext', editContext) as this;
  }

  updateModel(params: UpdateUIModelParams): this {
    let newModel: this = params.dataPath ? this.set('dataPath', params.dataPath.value) as this : this;
    newModel = params.data ? this.updateData(params.data.value, params.lastState) : newModel;
    newModel = params.editContext ? this.updateEditContext(params.editContext.value, params.lastState) : newModel;
    return newModel;
  }

  getState(): UIModelState | undefined {
    return undefined;
  }
}

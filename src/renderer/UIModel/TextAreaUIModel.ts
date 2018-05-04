import { Record } from 'immutable';
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from './UIModel';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import DataModelBase from '../DataModel/DataModelBase';
import TextAreaUIDefinition from '../UIDefinition/TextAreaUIDefinition';
import UIModelState from './UIModelState';
import { createSetValueAction } from './UIModelAction';
import { StringDataModel } from '../DataModel/ScalarDataModel';

interface TextAreaUIModelState extends UIModelState {

}

const TextAreaUIModelRecord = Record({
  ...UIModelPropsDefault
});

export default class TextAreaUIModel extends TextAreaUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TextAreaUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;

  //#region private static function for props
  //#endregion

  public constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({
      ...props
    });
  }

  public get text(): string {
    if (this.data instanceof StringDataModel) {
      return this.data.value;
    } else {
      return '';
    }
  }

  //#region manipulation
  public inputText(dispatch: ActionDispatch, value: string): void {
    dispatch(createSetValueAction(this.dataPath, new StringDataModel(value)));
  }
  //#endregion

  //#region implementation for UIModel
  public updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    return this.set('data', data) as this;
  }

  public updateEditContext(editContext: EditContext, lastState: UIModelState | undefined): this {
    return this.set('editContext', editContext) as this;
  }

  public getState(lastState: UIModelState | undefined): TextAreaUIModelState | undefined {
    return undefined;
  }
  //#endregion
}
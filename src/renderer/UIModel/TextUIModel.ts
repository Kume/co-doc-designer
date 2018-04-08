import { Record } from "immutable";
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from "./UIModel";
import { StringDataModel } from "../DataModel/ScalarDataModel";
import ContentListUIDefinition from "../UIDefinition/ContentListUIDefinition";
import DataPath from "../DataModel/DataPath";
import DataModelBase from "../DataModel/DataModelBase";
import EditContext from "../UIView/EditContext";
import { createSetValueAction } from "./UIModelAction";

const TextUIModelRecord = Record({
  ...UIModelPropsDefault,
});

export default class TextUIModel extends TextUIModelRecord implements UIModel {
  public readonly data: DataModelBase | undefined;
  public readonly definition: ContentListUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;

  public constructor(props: UIModelProps) {
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

  updateData(data: DataModelBase): UIModel {
    return this.set('data', data) as this;
  }

  updateEditContext(editContext: EditContext): UIModel {
    return this.set('editContext', editContext) as this;
  }
}

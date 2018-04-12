import DataModelBase from "../DataModel/DataModelBase";
import UIDefinitionBase from "../UIDefinition/UIDefinitionBase";
import EditContext from "./EditContext";
import { UIModelAction } from "./UIModelAction";
import DataPath from "../DataModel/DataPath";

export interface UIModelProps {
  definition: UIDefinitionBase;
  data?: DataModelBase;
  dataPath: DataPath,
  editContext: EditContext;
}

export const UIModelPropsDefault = {
  definition: undefined,
  data: undefined,
  dataPath: DataPath,
  editContext: new EditContext()
};

export interface ActionDispatch {
  (action: UIModelAction): void;
}

export default interface UIModel {
  readonly data: DataModelBase | undefined;
  readonly definition: UIDefinitionBase;
  readonly editContext: EditContext;
  readonly dataPath: DataPath;
  updateData(data: DataModelBase | undefined): UIModel;
  updateEditContext(editContext: EditContext): UIModel;
}

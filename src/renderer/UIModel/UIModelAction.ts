import DataPath from "../DataModel/DataPath";
import DataModelBase from "../DataModel/DataModelBase";
import EditContext from "../UIView/EditContext";

export enum ActionType {
  SetValue,
  ChangeEditContext,
  OpenModel,
}

export interface UIModelAction {
  type: ActionType;
}

export interface SetValueAction extends UIModelAction {
  path: DataPath;
  data: DataModelBase;
}

export interface ChangeEditContextAction extends UIModelAction {
  editContext: EditContext;
}

export function createSetValueAction(path: DataPath, data: DataModelBase): SetValueAction {
  return { type: ActionType.SetValue, path, data }
}

export function createChangeEditContextAction(editContext: EditContext) {
  return { type: ActionType.ChangeEditContext, editContext }
}

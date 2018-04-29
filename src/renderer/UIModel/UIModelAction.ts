import DataPath from '../DataModel/DataPath';
import DataModelBase from '../DataModel/DataModelBase';
import EditContext from './EditContext';
import { UIModelProps } from './UIModel';

export enum ActionType {
  SetValue,
  ChangeEditContext,
  OpenModal,
  CloseModal
}

export interface NotifyDataFunction {
  (data: DataModelBase): void;
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

export interface OpenModalAction extends UIModelAction {
  modelProps: UIModelProps;
  onSubmit: NotifyDataFunction;
}

export function createSetValueAction(path: DataPath, data: DataModelBase): SetValueAction {
  return { type: ActionType.SetValue, path, data };
}

export function createChangeEditContextAction(editContext: EditContext): ChangeEditContextAction {
  return { type: ActionType.ChangeEditContext, editContext };
}

export function createOpenModalAction(modelProps: UIModelProps, onSubmit: NotifyDataFunction): OpenModalAction {
  return { type: ActionType.OpenModal, modelProps, onSubmit };
}

export function createCloseModalAction(): UIModelAction {
  return { type: ActionType.CloseModal };
}

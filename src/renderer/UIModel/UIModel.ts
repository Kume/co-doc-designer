import DataModelBase, { DataCollectionElement } from '../DataModel/DataModelBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import EditContext from './EditContext';
import { UIModelAction } from './UIModelAction';
import DataPath from '../DataModel/DataPath';
import UIModelState from './UIModelState';

export interface UIModelProps {
  definition: UIDefinitionBase;
  data: DataModelBase | undefined;
  dataPath: DataPath;
  editContext: EditContext | undefined;
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

export interface CollectValue {
  (targetPath: DataPath, basePath: DataPath): DataCollectionElement[];
}

export interface UpdateParams<T> {
  value: T
}

export interface UpdateUIModelParams {
  data?: UpdateParams<DataModelBase | undefined>;
  dataPath?: UpdateParams<DataPath>;
  editContext?: UpdateParams<EditContext | undefined>;
  lastState: UIModelState | undefined;
}

export namespace UpdateUIModelParams {
  export function updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined) {
    return {data: {value: data}, lastState};
  }
  export function updateContext(editContext: EditContext | undefined, lastState: UIModelState | undefined) {
    return {editContext: {value: editContext}, lastState};
  }
}

export default interface UIModel {
  readonly data: DataModelBase | undefined;
  readonly definition: UIDefinitionBase;
  readonly editContext: EditContext | undefined;
  readonly dataPath: DataPath;
  updateModel(params: UpdateUIModelParams): UIModel;
  getState(lastState: UIModelState | undefined): UIModelState | undefined;
}

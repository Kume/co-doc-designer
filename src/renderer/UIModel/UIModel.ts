import DataModelBase from '../DataModel/DataModelBase';
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

export default interface UIModel {
  readonly data: DataModelBase | undefined;
  readonly definition: UIDefinitionBase;
  readonly editContext: EditContext;
  readonly dataPath: DataPath;
  updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): UIModel;
  updateEditContext(editContext: EditContext, lastState: UIModelState | undefined): UIModel;
  getState(lastState: UIModelState | undefined): UIModelState | undefined;
}

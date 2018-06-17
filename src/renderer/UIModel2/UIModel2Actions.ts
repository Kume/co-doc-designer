import DataPath from '../DataModel/Path/DataPath';
import { DataAction, DeleteDataAction, SetDataAction } from '../DataModel/DataAction';
import EditContext from '../UIModel/EditContext';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';

type UIModelActionType = 'UpdateData' | 'UpdateEditContext' | 'UpdateState';

export interface UIModelAction {
  type: UIModelActionType;
}

export interface UIModelUpdateDataAction extends UIModelAction {
  type: 'UpdateData';
  path: DataPath;
  dataAction: DataAction;
}

export interface UIModelUpdateEditContextAction extends UIModelAction {
  type: 'UpdateEditContext';
  editContext: EditContext;
}

export interface UIModelUpdateStateAction extends UIModelAction {
  type: 'UpdateState';
  path: DataPath;
  action: DataAction;
}

export namespace UIModelAction {
  export namespace Creators {
    export function setData(path: DataPath, data: DataModelBase): UIModelUpdateDataAction {
      return {
        type: 'UpdateData',
        path,
        dataAction: <SetDataAction> { type: 'Set', data }
      };
    }

    export function deleteData(path: DataPath, targetIndex: CollectionIndex): UIModelUpdateDataAction {
      return {
        type: 'UpdateData',
        path,
        dataAction: <DeleteDataAction> { type: 'Delete', targetIndex }
      };
    }
  }
}

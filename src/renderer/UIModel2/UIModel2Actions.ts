import DataPath from '../DataModel/Path/DataPath';
import { DataAction, DeleteDataAction, SetDataAction } from '../DataModel/DataAction';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import { List } from 'immutable';
import { UIModel2State } from './types';

type UIModelActionType = 'UpdateData' | 'UpdateState';

export interface UIModelAction {
  type: UIModelActionType;
}

export interface UIModelUpdateDataAction extends UIModelAction {
  type: 'UpdateData';
  path: DataPath;
  dataAction: DataAction;
}

export interface UIModelUpdateStateAction extends UIModelAction {
  type: 'UpdateState';
  path: List<CollectionIndex>;
  state: UIModel2State | undefined;
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

  export function isUpdateDataAction(action: UIModelAction): action is UIModelUpdateDataAction {
    return action.type === 'UpdateData';
  }

  export function isUpdateStateAction(action: UIModelAction): action is UIModelUpdateStateAction {
    return action.type === 'UpdateState';
  }
}

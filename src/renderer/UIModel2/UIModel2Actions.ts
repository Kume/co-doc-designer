import DataPath from '../DataModel/Path/DataPath';
import { DataAction, DeleteDataAction, MoveDataAction, SetDataAction } from '../DataModel/DataAction';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import { UIModel2State } from './types';
import { ModelPath } from './UIModel2';

type UIModelActionType = 'UpdateData' | 'UpdateState' | 'Focus';

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
  path: ModelPath;
  state: UIModel2State | undefined;
}

export interface UIModelFocusAction extends UIModelAction {
  type: 'Focus';
  path: DataPath;
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

    export function moveData(path: DataPath, from: CollectionIndex, to: CollectionIndex): UIModelUpdateDataAction {
      return {
        type: 'UpdateData',
        path,
        dataAction: <MoveDataAction> { type: 'Move', from, to }
      };
    }
  }

  export function isUpdateDataAction(action: UIModelAction): action is UIModelUpdateDataAction {
    return action.type === 'UpdateData';
  }

  export function isUpdateStateAction(action: UIModelAction): action is UIModelUpdateStateAction {
    return action.type === 'UpdateState';
  }

  export function isFocusAction(action: UIModelAction): action is UIModelFocusAction {
    return action.type === 'Focus';
  }
}

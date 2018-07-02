import DataModelBase, { CollectionIndex } from './DataModelBase';

export type DataActionType = 'Insert' | 'Move' | 'Set' | 'Delete';

export interface DataAction {
  type: DataActionType;
}

export interface InsertDataAction extends DataAction {
  type: 'Insert';
  targetIndex?: CollectionIndex;
  data: DataModelBase;
  key?: string;
  isAfter?: boolean;
  sortOrder?: string[];
}

export interface DeleteDataAction extends DataAction {
  type: 'Delete';
  targetIndex: CollectionIndex;
}

export interface SetDataAction extends DataAction {
  type: 'Set';
  data: DataModelBase;
}

export interface MoveDataAction extends DataAction {
  type: 'Move';
  from: CollectionIndex;
  to: CollectionIndex;
  isAfter?: boolean;
}

export module DataAction {
  export function isSetDataAction(action: DataAction): action is SetDataAction {
    return action.type === 'Set';
  }

  export function isSetDeleteAction(action: DataAction): action is DeleteDataAction {
    return action.type === 'Delete';
  }

  export function isInsertDataAction(action: DataAction): action is InsertDataAction {
    return action.type === 'Insert';
  }

  export function isMoveDataAction(action: DataAction): action is MoveDataAction {
    return action.type === 'Move';
  }
}

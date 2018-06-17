import DataModelBase, { CollectionIndex } from './DataModelBase';

export type DataActionType = 'Insert' | 'Append' | 'Set' | 'Delete';

export interface DataAction {
  type: DataActionType;
}

export interface AppendDataAction extends DataAction {
  type: 'Append',
  data: DataModelBase;
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

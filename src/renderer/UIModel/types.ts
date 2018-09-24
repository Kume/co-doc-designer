import { Record } from 'immutable';
import { DataCollectionElement, default as DataModelBase } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';

export type UIModelState = Record<any>;
export interface CollectValueHint {
  basePathData?: DataModelBase;
}

export interface CollectValue {
  (targetPath: DataPath, basePath: DataPath, hint?: CollectValueHint): DataCollectionElement[];
}

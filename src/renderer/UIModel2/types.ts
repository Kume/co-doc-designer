import { Map } from 'immutable';
import { DataCollectionElement } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';

export type UIModel2State = Map<string, any>;
export interface CollectValue {
  (targetPath: DataPath, basePath: DataPath): DataCollectionElement[];
}

import DataPath from './Path/DataPath';
import DataModelFactory from './DataModelFactory';
import DataPathElement, { DataPathElementMetadata } from './Path/DataPathElement';
import { DataAction } from './DataAction';

export interface DataCollectionElement {
  index?: CollectionIndex;
  path: DataPath;
  data: DataModelBase;
}

export namespace DataCollectionElement {
  export function getValue(element: DataCollectionElement, path: DataPath): DataModelBase | undefined {
    if (!element.data) { return undefined; }
    if (path.isEmptyPath && path.pointsKey) {
      return DataModelFactory.create(element.index);
    }
    return element.data.getValue(path);
  }
}

export default interface DataModelBase {
  getValue(path: DataPath): DataModelBase | undefined;
  applyAction(path: DataPath, action: DataAction, metadata?: DataPathElementMetadata): DataModelBase;
  collectValue(path: DataPath, absolutePath?: DataPath): DataCollectionElement[];
  removeValue(path: DataPath): DataModelBase;
  toJS(): any;
  toJsonObject(): any;
  toString(): string;
  equals(e: any): boolean;
}

export interface DataModelSideEffect {
  (data: DataModelBase, index: CollectionIndex): void;
}

export interface DataModelAsyncSideEffect {
  (data: DataModelBase, index: CollectionIndex): Promise<void>;
}

export type CollectionIndex = number | string;
export type CollectionIndexes = number[] | string[];

export interface DataModelConvertWithIndex<T> {
  (data: DataModelBase, index: CollectionIndex): T;
}

export interface DataModelConvertWithPathElement<T> {
  (data: DataModelBase, path: DataPathElement): T;
}

export interface DataModelConvertWithListIndex<T> {
  (data: DataModelBase, index: number): T;
}

export interface DataModelAsyncConvert<T> {
  (data: DataModelBase): Promise<T>;
}

export interface CollectionDataModel extends DataModelBase {
  dataIsEmpty: boolean;
  allDataSize: number;
  forEachData(sideEffect: DataModelSideEffect): void;
  // public abstract forEachDataAsync(sideEffect: DataModelAsyncSideEffect): Promise<void>;
  mapDataWithIndex<T>(converter: DataModelConvertWithIndex<T>): Array<T>;
  moveUpForCollectionIndex(index: CollectionIndex): CollectionDataModel;
  moveDownForCollectionIndex(index: CollectionIndex): CollectionDataModel;
  mapAllData<T>(converter: DataModelConvertWithListIndex<T>): T[];
}

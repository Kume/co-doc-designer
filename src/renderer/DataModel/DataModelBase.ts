import DataPath from './Path/DataPath';
import DataModelFactory from './DataModelFactory';
import DataPathElement, { DataPathElementMetadata } from './Path/DataPathElement';
import { DataAction } from './DataAction';

export interface DataCollectionElement {
  index?: CollectionIndex;
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

export default abstract class DataModelBase {
  public abstract getValue(path: DataPath): DataModelBase | undefined;
  public abstract applyAction(path: DataPath, action: DataAction, metadata?: DataPathElementMetadata): DataModelBase;
  public abstract collectValue(path: DataPath): DataCollectionElement[];
  public abstract removeValue(path: DataPath): DataModelBase;
  public abstract toJS(): string;
  public abstract toJsonObject(): any;
  public abstract toString(): string;
  public abstract equals(e: any): boolean;
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

export abstract class CollectionDataModel extends DataModelBase {
  public abstract forEachData(sideEffect: DataModelSideEffect): void;
  // public abstract forEachDataAsync(sideEffect: DataModelAsyncSideEffect): Promise<void>;
  public abstract mapDataWithIndex<T>(converter: DataModelConvertWithIndex<T>): Array<T>;
  public abstract get dataIsEmpty(): boolean;
  public abstract moveUpForCollectionIndex(index: CollectionIndex): CollectionDataModel;
  public abstract moveDownForCollectionIndex(index: CollectionIndex): CollectionDataModel;
  public abstract mapAllData<T>(converter: DataModelConvertWithListIndex<T>): T[];
  public abstract get allDataSize(): number;
}

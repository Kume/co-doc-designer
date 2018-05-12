import DataPath from './DataPath';
import DataModelFactory from './DataModelFactory';

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
  public abstract setValue(path: DataPath, value: DataModelBase): DataModelBase;
  public abstract getValue(path: DataPath): DataModelBase | undefined;
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

export interface DataModelConvert<T> {
  (data: DataModelBase): T;
}

export type CollectionIndex = number | string;

export interface DataModelConvertWithIndex<T> {
  (data: DataModelBase, index: CollectionIndex): T;
}

export interface DataModelAsyncConvert<T> {
  (data: DataModelBase): Promise<T>;
}

export abstract class CollectionDataModel extends DataModelBase {
  public abstract forEachData(sideEffect: DataModelSideEffect): void;
  // public abstract forEachDataAsync(sideEffect: DataModelAsyncSideEffect): Promise<void>;
  public abstract mapData<T>(converter: DataModelConvert<T>): Array<T>;
  public abstract mapDataWithIndex<T>(converter: DataModelConvertWithIndex<T>): Array<T>;
  public abstract get dataIsEmpty(): boolean;
  public abstract moveUpForCollectionIndex(index: CollectionIndex): CollectionDataModel;
  public abstract moveDownForCollectionIndex(index: CollectionIndex): CollectionDataModel;
}

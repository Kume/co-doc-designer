import DataPath from './DataPath';

export default abstract class DataModelBase {
  public abstract setValue(path: DataPath, value: DataModelBase): DataModelBase;
  public abstract getValue(path: DataPath): DataModelBase | undefined;
  public abstract removeValue(path: DataPath): DataModelBase;
  public abstract toJS(): string;
  public abstract toJsonObject(): any;
}

export interface DataModelSideEffect {
  (data: DataModelBase): void;
}

export interface DataModelAsyncSideEffect {
  (data: DataModelBase): Promise<void>;
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
}

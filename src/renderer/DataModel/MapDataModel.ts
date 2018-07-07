import DataModelBase, {
  CollectionDataModel, CollectionIndex, DataCollectionElement,
  DataModelConvertWithIndex, DataModelConvertWithListIndex,
  DataModelSideEffect
} from './DataModelBase';
import { List, Record } from 'immutable';
import ScalarDataModel, { NullDataModel, ScalarDataSource, StringDataModel } from './ScalarDataModel';
import DataPath from './Path/DataPath';
import DataPathElement from './Path/DataPathElement';
import DataModelFactory from './DataModelFactory';
import { DataAction, DeleteDataAction, InsertDataAction, MoveDataAction, SetDataAction } from './DataAction';
import DataOperationError from './Error/DataOperationError';

const MapDataModelElementRecord = Record({
  key: StringDataModel.empty,
  value: NullDataModel.null
});

export interface MapDataModelPrivateItem {
  k?: string;
  v: ScalarDataSource | object;
}

export class MapDataModelElement extends MapDataModelElementRecord {
  public readonly key: string | undefined;
  public readonly value: DataModelBase;

  protected _keyAsDataModel?: ScalarDataModel;

  public constructor(key: string | undefined, value: DataModelBase) {
    super({key, value});
  }

  public setValue(value: DataModelBase): MapDataModelElement {
    return this.set('value', value) as this;
  }

  public setKey(key: string | undefined): MapDataModelElement {
    return this.set('key', key) as this;
  }

  public get hasKey(): boolean {
    return !!this.key;
  }

  public get keyAsDataModel(): ScalarDataModel | undefined {
    if (this.key) {
      return this._keyAsDataModel ? this._keyAsDataModel : this._keyAsDataModel = new StringDataModel(this.key);
    } else {
      return undefined;
    }
  }
}

export class ValidMapDataModelElement extends MapDataModelElement {
  public readonly key: string;

  public get keyAsDataModel(): ScalarDataModel {
    return this._keyAsDataModel ? this._keyAsDataModel : this._keyAsDataModel = new StringDataModel(this.key);
  }
}

const MapDataModelRecord = Record({
  list: List.of<MapDataModelElement>()
});

export default class MapDataModel extends MapDataModelRecord implements CollectionDataModel {
  public static readonly empty = new MapDataModel({});
  public readonly list: List<MapDataModelElement>;

  public static create(list: object | MapDataModelPrivateItem[]) {
    return new MapDataModel(list);
  }

  private static formatValues(list: object | MapDataModelPrivateItem[]) {
    let formattedValues: List<MapDataModelElement> = List.of<MapDataModelElement>();
    if (Array.isArray(list)) {
      for (const item of list) {
        const element = new MapDataModelElement(item.k, DataModelFactory.create(item.v));
        formattedValues = formattedValues.push(element);
      }
    } else {
      for (const key of Object.keys(list)) {
        const value = list[key];
        formattedValues = formattedValues.push(new MapDataModelElement(key, DataModelFactory.create(value)));
      }
    }
    return formattedValues;
  }

  constructor(list: object | MapDataModelPrivateItem[]) {
    super({list: MapDataModel.formatValues(list)});
  }

  public valueForKey(key: string): DataModelBase | undefined {
    const foundElement = this.list.find(element => element!.key === key);
    return foundElement ? foundElement.value : undefined;
  }

  public setValueForKey(key: string, value: DataModelBase): this {
    const index = this.indexForKey(key);
    return this.set('list', this.list.set(index, new MapDataModelElement(key, value)));
  }

  public valueForListIndex(index: number): DataModelBase | undefined {
    const node = this.list.get(index);
    return node && node.value;
  }

  public keyForIndex(index: number): string | undefined {
    const node = this.list.get(index);
    return node && node.key;
  }

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  applyAction(path: DataPath, action: DataAction): DataModelBase {
    if (path.isEmptyPath) {
      switch (action.type) {
        case 'Insert':
          return this.applyInsertAction(action as InsertDataAction);
        case 'Delete':
          return this.applyDeleteAction(action as DeleteDataAction);
        case 'Move':
          return this.applyMoveAction(action as MoveDataAction);
        case 'Set':
          return (<SetDataAction> action).data;
        default:
          throw new DataOperationError('Invalid operation', {path, action, targetData: this});
      }
    } else {
      const pathElement = path.firstElement;
      const index = this.indexForPath(pathElement);
      if (index >= 0) {
        let node = this.list.get(index);
        if (action.type === 'Set' && path.pointsKey && path.elements.size === 1) {
          const newKey = (<SetDataAction> action).data;
          if (this.validateCanSetKey(index, newKey)) {
            node = node.setKey(newKey.value);
          }
        } else {
          node = node.setValue(node.value.applyAction(path.shift(), action));
        }
        return this.set('list', this.list.set(index, node));
      } else {
        if (DataAction.isSetDataAction(action) && path.elements.size === 1) {
          const newNode = new MapDataModelElement(path.firstElement.asMapKeyOrUndefined, action.data);
          return this.set('list', this.list.push(newNode));
        } else {
          throw new DataOperationError('Invalid path for action', {path, action, targetData: this});
        }
      }
    }
  }

  public applyDeleteAction(action: DeleteDataAction): DataModelBase {
    if (typeof action.targetIndex === 'number') {
      if (this.isValidIndex(action.targetIndex)) {
        return this.set('list', this.list.delete(action.targetIndex));
      } else {
        throw new DataOperationError('Invalid index.', {action, targetData: this});
      }
    } else {
      const index = this.indexForKey(action.targetIndex);
      if (index >= 0) {
        return this.set('list', this.list.delete(index));
      } else {
        throw new DataOperationError('Invalid key.', {action, targetData: this});
      }
    }
  }

  public applyInsertAction(action: InsertDataAction): DataModelBase {
    const node = new MapDataModelElement(action.key, action.data);
    if (action.targetIndex === undefined) {
      const newList = action.isAfter ? this.list.push(node) : this.list.unshift(node);
      return this.set('list', newList);
    } else if (typeof action.targetIndex === 'number') {
      if (this.isValidIndexForInsert(action.targetIndex, action.isAfter)) {
        const targetIndex = action.isAfter ? action.targetIndex + 1 : action.targetIndex;
        return this.set('list', this.list.insert(targetIndex, node));
      } else {
        throw new DataOperationError('Invalid index.', {action, targetData: this});
      }
    } else {
      const index = this.indexForKey(action.targetIndex);
      if (index >= 0) {
        return this.set('list', this.list.insert(action.isAfter ? index + 1 : index, node));
      } else {
        throw new DataOperationError('Invalid key.', {action, targetData: this});
      }
    }
  }

  public applyMoveAction(action: MoveDataAction): this {
    if (!(this.isValidCollectionIndex(action.from) && this.isValidIndexForInsert(action.to, action.isAfter))) {
      throw new DataOperationError('Invalid index to move.', {action, targetData: this});
    }
    const from = this.indexForCollectionIndex(action.from);
    let to = this.indexForCollectionIndex(action.to);
    if (action.isAfter) { to += 1; }
    if (to > from) { to -= 1; }
    const targetData = this.list.get(from);
    return this.set('list', this.list.delete(from).insert(to, targetData));
  }

  public toJsonObject(): object {
    const object = {};
    this.list.forEach((item: ValidMapDataModelElement) => {
      if (item.key && object[item.key] === undefined) {
        object[item.key] = item.value.toJsonObject();
      }
    });
    return object;
  }

  public toPrivateJsonObject(): MapDataModelPrivateItem[] {
    const objects: MapDataModelPrivateItem[] = [];
    this.list.forEach(item => {
      objects.push({k: item!.key, v: item!.value.toJsonObject()});
    });
    return objects;
  }

  public getValue(path: DataPath): DataModelBase | undefined {
    if (path.elements.isEmpty()) {
      return this;
    } else {
      const index = this.indexForPath(path.elements.first());
      if (index >= 0) {
        if (path.pointsKey && path.elements.size === 1) {
          return this.list.get(index).keyAsDataModel;
        } else {
          return this.list.get(index).value.getValue(path.shift());
        }
      } else {
        return undefined;
      }
    }
  }

  public removeValue(path: DataPath): this {
    if (path.elements.isEmpty()) {
      throw new Error();
    } else if (path.elements.size === 1) {
      const index = this.indexForKey(path.elements.get(0).asMapKey);
      return this.set('list', this.list.delete(index));
    } else {
      const key = path.elements.first().asMapKey;
      const value = this.valueForKey(key);
      if (value) {
        const newValue = value.removeValue(path.shift());
        return this.setValueForKey(key, newValue);
      }
      return this;
    }
  }

  public collectValue(path: DataPath): DataCollectionElement[] {
    if (path.elements.isEmpty()) {
      return [{data: this}];
    }

    if (path.firstElement.isWildCard) {
      if (path.elements.size === 1 && path.pointsKey) {
        return this._validList.map(node => ({
          index: node!.key,
          data: node!.keyAsDataModel
        })).toArray();
      } else {
        let values: DataCollectionElement[] = [];
        const childPath = path.shift();
        this.forEachData((data, index) => {
          let tmpValues = data.collectValue(childPath);
          if (path.isSingleElement) {
            tmpValues = tmpValues.map(value => ({index, data: value.data}));
          }
          values = values.concat(tmpValues);
        });
        return values;
      }
    } else {
      const index = this.indexForPath(path.firstElement);
      if (index >= 0) {
        const node = this.list.get(index) as ValidMapDataModelElement;
        if (path.elements.size === 1 && path.pointsKey) {
          return [{ index, data: node.keyAsDataModel}];
        } else {
          let values = node.value.collectValue(path.shift());
          if (path.isSingleElement) {
            return values.map(value => ({index, data: value.data}));
          } else {
            return values;
          }
        }
      } else {
        return [];
      }
    }
  }

  moveUpForCollectionIndex(index: CollectionIndex): CollectionDataModel {
    if (typeof index === 'string') {
      return this.moveUpForKey(index);
    } else {
      // TODO 警告
      return this;
    }
  }

  moveDownForCollectionIndex(index: CollectionIndex): CollectionDataModel {
    if (typeof index === 'string') {
      return this.moveDownForKey(index);
    } else {
      // TODO 警告
      return this;
    }
  }

  public moveUpForKey(key: string): this {
    const index1 = this.indexForKey(key);
    if (index1 <= 0 || index1 >= this.list.size) {
      // TODO 警告
      return this;
    }
    return this._transposeOrder(index1, index1 - 1);
  }

  public moveDownForKey(key: string): this {
    const index1 = this.indexForKey(key);
    if (index1 < 0 || index1 >= this.list.size - 1) {
      // TODO 警告
      return this;
    }
    return this._transposeOrder(index1, index1 + 1);
  }

  public transposeOrderWithKey(key1: string, key2: string): this {
    const index1 = this.indexForKey(key1);
    if (index1 < 0) {
      // TODO 警告
      return this;
    }
    const index2 = this.indexForKey(key2);
    if (index2 < 0) {
      // TODO 警告
      return this;
    }
    return this._transposeOrder(index1, index2);
  }

  public forEachData(sideEffect: DataModelSideEffect): void {
    this._validList.forEach((item, index) => sideEffect(item!.value, item!.key || index!));
  }

  public mapDataWithIndex<T>(converter: DataModelConvertWithIndex<T>): Array<T> {
    const list: Array<T> = [];
    this._validList.forEach(item => {
      list.push(converter(item!.value, item!.key));
    });
    return list;
  }

  mapAllData<T>(converter: DataModelConvertWithListIndex<T>): T[] {
    const list: T[] = [];
    this.list.forEach((item, index) => {
      list.push(converter(item!.value, index!));
    });
    return list;
  }

  public get dataIsEmpty(): boolean {
    return this.list.isEmpty();
  }

  public get dataSize(): number {
    return this._validList.size;
  }

  public get allDataSize(): number {
    return this.list.size;
  }

  public get firstKey(): string | undefined {
    if (this.list.isEmpty()) {
      return undefined;
    } else {
      const firstValid = this.list.find(node => !!node!.key);
      return firstValid && firstValid.key;
    }
  }

  public toString(): string {
    return JSON.stringify(this.toJsonObject());
  }

  public indexForCollectionIndex(index: CollectionIndex): number {
    return typeof index === 'string' ? this.indexForKey(index) : index;
  }

  public indexForKey(key: string): number {
    return this.list.findIndex(element => element!.key === key);
  }

  public isValidKey(key: string): boolean {
    return this.indexForKey(key) >= 0;
  }

  public isValidIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < this.list.size;
  }

  public isValidCollectionIndex(index: CollectionIndex): boolean {
    return typeof index === 'number' ? this.isValidIndex(index) : this.isValidKey(index);
  }

  private isValidIndexForInsert(index: CollectionIndex, isAfter: boolean | undefined) {
    if (typeof index === 'number') {
      if (index < 0) { return false; }
      const listSize = this.list.size;
      return isAfter ? index < listSize : index <= listSize;
    } else {
      return this.isValidKey(index);
    }
  }

  private indexForPath(pathElement: DataPathElement): number {
    if (pathElement.isListIndex) {
      const index = pathElement.asListIndex;
      return this.isValidIndex(index) ? index : -1;
    } else if (pathElement.canBeMapKey) {
      return this.indexForKey(pathElement.asMapKey);
    } else {
      return -1;
    }
  }

  private validateCanSetKey(targetIndex: number, value: DataModelBase): value is StringDataModel {
    if (!(value instanceof StringDataModel)) {
      throw new Error('Cannot set value that is not string as key');
    }
    const indexForKey = this.indexForKey(value.value);
    if (indexForKey >= 0 && indexForKey !== targetIndex) {
      throw new Error('Cannot set duplicated key');
    }
    return true;
  }

  private _transposeOrder(index1: number, index2: number): this {
    const value1 = this.list.get(index1);
    const value2 = this.list.get(index2);
    return this.withMutations(map =>
      map.setIn(['list', index1], value2)
        .setIn(['list', index2], value1)
    ) as this;
  }

  private get _validList(): List<ValidMapDataModelElement> {
    return this.list.filter(node => !!node!.key) as List<ValidMapDataModelElement>;
  }
}

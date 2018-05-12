import DataModelBase, {
  CollectionDataModel, CollectionIndex, DataCollectionElement,
  DataModelConvert,
  DataModelConvertWithIndex,
  DataModelSideEffect
} from './DataModelBase';
import { List, Record } from 'immutable';
import ScalarDataModel, { NullDataModel, StringDataModel } from './ScalarDataModel';
import DataPath from './DataPath';
import DataPathElement from './DataPathElement';
import DataModelFactory from './DataModelFactory';

const MapDataModelElementRecord = Record({
  key: StringDataModel.empty,
  value: NullDataModel.null
});

export class MapDataModelElement extends MapDataModelElementRecord {
  public readonly key: string;
  public readonly value: DataModelBase;

  private _keyAsDataModel?: ScalarDataModel;

  public constructor(key: string, value: DataModelBase) {
    super({key, value});
  }

  public set(key: string, value: any): MapDataModelElement {
    return super.set(key, value) as this;
  }

  public setValue(path: DataPath, value: DataModelBase): MapDataModelElement {
    return this.set('value', this.value.setValue(path, value));
  }

  public setKey(key: string): MapDataModelElement {
    return this.set('key', key);
  }

  public get keyAsDataModel(): ScalarDataModel {
    return this._keyAsDataModel ? this._keyAsDataModel : this._keyAsDataModel = new StringDataModel(this.key);
  }
}

const MapDataModelRecord = Record({
  list: List.of<MapDataModelElement>()
});

export default class MapDataModel extends MapDataModelRecord implements CollectionDataModel {
  public readonly list: List<MapDataModelElement>;

  private static formatValues(list: object) {
    let formattedValues: List<MapDataModelElement> = List.of<MapDataModelElement>();
    for (const key of Object.keys(list)) {
      const value = list[key];
      formattedValues = formattedValues.push(new MapDataModelElement(key, DataModelFactory.create(value)));
    }
    return formattedValues;
  }

  constructor(list: object) {
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

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  public setValue(path: DataPath, value: DataModelBase): DataModelBase {
    if (path.elements.size === 0) {
      return value;
    }
    const key = path.elements.first();

    const index = this.indexForPath(key);
    if (index >= 0) {
      let node = this.list.get(index);
      if (path.pointsKey && path.elements.size === 1) {
        if (this.validateCanSetKey(index, value)) {
          node = node.setKey(value.value);
        }
      } else {
        node = node.setValue(path.shift(), value);
      }
      return this.set('list', this.list.set(index, node));
    } else {
      const pushedList = this.list.push(new MapDataModelElement(key.asMapKey, value));
      return this.set('list', pushedList);
    }
  }

  public toJsonObject(): any {
    const object = {};
    this._validList.forEach((item: MapDataModelElement) => {
      object[item.key] = item.value.toJsonObject();
    });
    return object;
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
        const node = this.list.get(index);
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
    this.list.forEach((item, index) => sideEffect(item!.value, item!.key || index!));
  }

  public mapData<T>(converter: DataModelConvert<T>): Array<T> {
    const list: Array<T> = [];
    this.list.forEach(item => {
      list.push(converter(item!.value));
    });
    return list;
  }

  public mapDataWithIndex<T>(converter: DataModelConvertWithIndex<T>): Array<T> {
    const list: Array<T> = [];
    this.list.forEach(item => {
      list.push(converter(item!.value, item!.key));
    });
    return list;
  }

  public get dataIsEmpty(): boolean {
    return this.list.isEmpty();
  }

  public get firstKey(): string | undefined {
    if (this.list.isEmpty()) {
      return undefined;
    } else {
      return this.list.first().key;
    }
  }

  public toString(): string {
    return JSON.stringify(this.toJsonObject());
  }

  public indexForKey(key: string): number {
    return this.list.findIndex(element => element!.key === key);
  }

  public isValidKey(key: string): boolean {
    return this.indexForKey(key) >= 0;
  }

  private indexForPath(pathElement: DataPathElement): number {
    if (pathElement.canBeMapKey) {
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

  private get _validList(): List<MapDataModelElement> {
    return this.list.filter(node => !!node!.key) as List<MapDataModelElement>;
  }
}

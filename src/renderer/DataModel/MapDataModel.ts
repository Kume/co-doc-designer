import DataModelBase, {
  CollectionDataModel,
  DataModelConvert,
  DataModelConvertWithIndex,
  DataModelSideEffect
} from './DataModelBase';
import { List, Record } from 'immutable';
import ScalarDataModel from './ScalarDataModel';
import DataModelFactory from './DataModelFactory';
import DataPath from './DataPath';
import DataPathElement from './DataPathElement';

export class MapDataModelElement extends Record({key: new ScalarDataModel(''), value: new ScalarDataModel(null)}) {
  public readonly key: ScalarDataModel;
  public readonly value: DataModelBase;

  public constructor(key: string, value: string);
  public constructor(key: string, value: DataModelBase);
  public constructor(key: any, value: any) {
    if (!(key instanceof ScalarDataModel)) {
      key = new ScalarDataModel(key);
    }
    if (!(value instanceof DataModelBase)) {
      value = DataModelFactory.createDataModel(value);
    }
    super({key, value});
  }

  public set(key: string, value: any): MapDataModelElement {
    return super.set(key, value) as this;
  }

  public setValue(path: DataPath, value: DataModelBase): MapDataModelElement {
    return this.set('value', this.value.setValue(path, value));
  }

  public setKey(key: ScalarDataModel): MapDataModelElement {
    return this.set('key', key);
  }
}

const MapDataModelRecord = Record({
  list: List.of<MapDataModelElement>()
});

export default class MapDataModel extends MapDataModelRecord implements CollectionDataModel {
  public readonly list: List<MapDataModelElement>;

  private static formatValues(list: any) {
    let formattedValues: List<MapDataModelElement> = List.of<MapDataModelElement>();
    if (typeof list === 'object') {
      const keys = Object.keys(list);
      for (const key of keys) {
        const value = list[key];
        formattedValues = formattedValues.push(new MapDataModelElement(key, value));
      }
    }
    return formattedValues;
  }

  constructor(list: object);
  constructor(list: any) {
    super({list: MapDataModel.formatValues(list)});
  }

  public valueForKey(key: string): DataModelBase | undefined;
  public valueForKey(key: ScalarDataModel): DataModelBase | undefined;
  public valueForKey(key: any): DataModelBase | undefined {
    if (!(key instanceof ScalarDataModel)) {
      key = new ScalarDataModel(key);
    }
    const foundElement = this.list.find(element => element!.key.equals(key));
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
    if (path.elements.size > 0) {
      const key = path.elements.first();
      const index = this.indexForPath(key);
      if (index >= 0) {
        let node = this.list.get(index);
        if (path.pointsKey && path.elements.size === 1) {
          if (this.validateCanSetKey(index, value)) {
            node = node.setKey(value);
          }
        } else {
          node = node.setValue(path.shift(), value);
        }
        return this.set('list', this.list.set(index, node));
      } else {
        const pushedList = this.list.push(new MapDataModelElement(key.getMapKey, value));
        return this.set('list', pushedList);
      }
    } else {
      return value;
    }
  }

  public toJsonObject(): any {
    const object = {};
    this.list.forEach((item: MapDataModelElement) => {
      object[item.key.value] = item.value.toJsonObject();
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
          return this.list.get(index).key;
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
      const index = this.indexForKey(path.elements.get(0).getMapKey);
      return this.set('list', this.list.delete(index));
    } else {
      const key = path.elements.first().getMapKey;
      const value = this.valueForKey(key);
      if (value) {
        const newValue = value.removeValue(path.shift());
        return this.setValueForKey(key, newValue);
      }
      return this;
    }
  }

  public forEachData(sideEffect: DataModelSideEffect): void {
    this.list.forEach(item => sideEffect(item!.value));
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

  public isValidKey(key: string): boolean {
    return this.indexForKey(key) >= 0;
  }

  public get firstKey(): ScalarDataModel | undefined {
    if (this.list.isEmpty()) {
      return undefined;
    } else {
      return this.list.first().key;
    }
  }

  public toString(): string {
    return JSON.stringify(this.toJsonObject());
  }

  private indexForPath(pathElement: DataPathElement): number {
    if (pathElement.canBeMapKey) {
      const key = new ScalarDataModel(pathElement.getMapKey);
      return this.list.findIndex(element => element!.key.equals(key));
    } else {
      return -1;
    }
  }

  private indexForKey(key: string): number {
    const keyModel = new ScalarDataModel(key);
    return this.list.findIndex(element => element!.key.equals(keyModel));
  }

  private validateCanSetKey(targetIndex: number, value: DataModelBase): value is ScalarDataModel {
    if (!(value instanceof ScalarDataModel)) {
      throw new Error('Cannot set value that is not string as key');
    }
    const indexForKey = this.indexForPath(DataPathElement.create(value.value));
    if (indexForKey >= 0 && indexForKey !== targetIndex) {
      throw new Error('Cannot set duplicated key');
    }
    return true;
  }
}

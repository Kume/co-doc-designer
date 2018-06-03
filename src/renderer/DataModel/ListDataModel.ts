import DataModelBase, {
  CollectionDataModel,
  CollectionIndex,
  DataCollectionElement,
  DataModelConvert,
  DataModelConvertWithIndex,
  DataModelConvertWithListIndex,
  DataModelSideEffect
} from './DataModelBase';
import { List, Record } from 'immutable';
import DataModelFactory from './DataModelFactory';
import DataPath from './DataPath';
import DataPathElement from './DataPathElement';
import { IntegerDataModel } from './ScalarDataModel';

const ListDataModelRecord = Record({
  list: List<DataModelBase>()
});

export default class ListDataModel extends ListDataModelRecord implements CollectionDataModel {
  public readonly list: List<DataModelBase>;

  private static formatValues(list: any) {
    let formattedValues: List<DataModelBase> = List.of<DataModelBase>();
    if (Array.isArray(list)) {
      formattedValues = List<DataModelBase>(list.map(i => DataModelFactory.create(i)));
    }
    return formattedValues;
  }

  constructor(list: any) {
    super({list: ListDataModel.formatValues(list)});
  }

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  public push(value: DataModelBase): this {
    return this.set('list', this.list.push(value));
  }

  public setValueForIndex(index: number, value: any): this {
    return this.set('list', this.list.set(
      index,
      DataModelFactory.create(value)));
  }

  public getValueForIndex(index: number): DataModelBase | undefined {
    return this.list.get(index);
  }

  public indexForValue(value: DataModelBase | undefined): number | undefined {
    if (value === undefined) { return undefined; }
    const size = this.list.size;
    for (let i = 0; i < size; i++) {
      if (this.list.get(i).equals(value)) {
        return i;
      }
    }
    return undefined;
  }

  public setValue(path: DataPath, value: DataModelBase): DataModelBase {
    if (path.elements.size === 0) {
      return value;
    }
    const pathElement = path.elements.first();

    if (pathElement.type === DataPathElement.Type.After) {
      return this.set('list', this.list.push(value));
    } else if (pathElement.type === DataPathElement.Type.Before) {
      // TODO
    }

    return this.set('list', this.list.set(
      pathElement.asListIndex,
      this.list.get(pathElement.asListIndex).setValue(path.shift(), value)));
  }

  public getValue(path: DataPath): DataModelBase | undefined {
    if (path.elements.isEmpty()) {
      return this;
    } else {
      const pathElement = path.elements.first();
      if (pathElement.canBeListIndex) {
        return this.list.get(pathElement.asListIndex).getValue(path.shift());
      } else {
        return undefined;
      }
    }
  }

  public collectValue(path: DataPath): DataCollectionElement[] {
    if (path.elements.isEmpty()) {
      return [{ data: this }];
    }

    const firstElement = path.firstElement;
    if (firstElement.isWildCard) {
      if (path.isSingleElement && path.pointsKey) {
        return this.mapDataWithIndex((value, index) => ({
          index, data: new IntegerDataModel(index as number)
        }));
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
    } else if (firstElement.canBeListIndex && this.isValidIndex(firstElement.asListIndex)) {
      const index = firstElement.asListIndex;
      if (path.isSingleElement && path.pointsKey) {
        return [{ index, data: new IntegerDataModel(index)}];
      } else {
        const values = this.list.get(index).collectValue(path.shift());
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

  public removeValue(path: DataPath): this {
    if (path.elements.isEmpty()) {
      throw new Error();
    }

    const index = path.elements.get(0).asListIndex;
    if (path.elements.size === 1) {
      return this.set('list', this.list.delete(index));
    } else {
      return this.set('list', this.list.get(index).removeValue(path.shift()));
    }
  }

  public moveUpForCollectionIndex(index: CollectionIndex): CollectionDataModel {
    if (typeof index === 'number') {
      return this.moveUp(index);
    } else {
      // TODO 警告
      return this;
    }
  }

  public moveDownForCollectionIndex(index: CollectionIndex): CollectionDataModel {
    if (typeof index === 'number') {
      return this.moveDown(index);
    } else {
      // TODO 警告
      return this;
    }
  }

  public moveUp(index: number): this {
    if (index <= 0 || index >= this.list.size) {
      // TODO 警告
      return this;
    }
    return this._transposeOrder(index, index - 1);
  }

  public moveDown(index: number): this {
    if (index < 0 || index >= this.list.size - 1) {
      // TODO 警告
      return this;
    }
    return this._transposeOrder(index, index + 1);
  }

  public forEachData(sideEffect: DataModelSideEffect): void {
    this.list.forEach((item, index) => sideEffect(item!, index!));
  }

  public mapData<T>(converter: DataModelConvert<T>): Array<T> {
    const list: Array<T> = [];
    this.list.forEach(item => {
      list.push(converter(item!));
    });
    return list;
  }

  public mapDataWithIndex<T>(converter: DataModelConvertWithIndex<T>): Array<T> {
    const list: Array<T> = [];
    this.list.forEach((item, index) => {
      list.push(converter(item!, index!));
    });
    return list;
  }

  mapAllData<T>(converter: DataModelConvertWithListIndex<T>): T[] {
    return this.mapDataWithIndex(converter);
  }

  public get dataIsEmpty(): boolean {
    return this.list.isEmpty();
  }

  public isValidIndex(index: number): boolean {
    return index >= 0 && index < this.list.size;
  }

  public toJsonObject(): any {
    const list: Array<DataModelBase> = [];
    this.list.forEach((item: DataModelBase) => {
      list.push(item.toJsonObject());
    });
    return list;
  }

  public toString(): string {
    return JSON.stringify(this.toJsonObject());
  }

  private _transposeOrder(index1: number, index2: number): this {
    const value1 = this.list.get(index1);
    const value2 = this.list.get(index2);
    return this.withMutations(map =>
      map.setIn(['list', index1], value2)
        .setIn(['list', index2], value1)
    ) as this;
  }
}

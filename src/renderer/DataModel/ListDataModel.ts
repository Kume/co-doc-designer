import DataModelBase, {
  CollectionDataModel, DataModelConvert, DataModelConvertWithIndex,
  DataModelSideEffect
} from './DataModelBase';
import { List, Record } from 'immutable';
import DataModelFactory from './DataModelFactory';
import DataPath from './DataPath';

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

  public setValueForIndex(index: number, value: any): this {
    return this.set('list', this.list.set(
      index,
      DataModelFactory.create(value)));
  }

  public getValueForIndex(index: number): DataModelBase | undefined {
    return this.list.get(index);
  }

  public setValue(path: DataPath, value: DataModelBase): DataModelBase {
    if (path.elements.size > 0) {
      const pathElement = path.elements.first();
      return this.set('list', this.list.set(
        pathElement.asListIndex,
        this.list.get(pathElement.asListIndex).setValue(path.shift(), value)));
    } else {
      return value;
    }
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

  public forEachData(sideEffect: DataModelSideEffect): void {
    this.list.forEach(item => sideEffect(item!));
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
}

import { isUnsignedIntegerString } from '../../../common/util';
import DataPath from './DataPath';
import { Record } from 'immutable';
import { CollectionIndex } from '../DataModelBase';

export interface IndexWithKey {
  index: number;
  key: string | undefined;
}

export type DataPathElementSource = string | number | symbol;
export type DataPathElementCompatible = DataPathElementSource | DataPathElement;

const DataPathElementRecord = Record({
  _type: 0,
  _value: null
});

class DataPathElement extends DataPathElementRecord {
  public static readonly SpecialName = {
    Key: '$key'
  };

  get type(): DataPathElement.Type {
    return this._type;
  }

  private readonly _value: any;
  private readonly _type: DataPathElement.Type;

  public static create(value: DataPathElementCompatible): DataPathElement {
    if (value instanceof DataPathElement) {
      return value;
    } else if (value === DataPathElement.keySymbol) {
      return DataPathElement.key;
    } else if (typeof value === 'number') {
      return new DataPathElement(value, DataPathElement.Type.ListIndex);
    } else if (typeof value === 'string') {
      return new DataPathElement(value, DataPathElement.Type.MapKey);
    } else {
      throw new Error();
    }
  }

  public static indexWithKey(index: number, key: string | undefined): DataPathElement {
    return new DataPathElement({ index, key }, DataPathElement.Type.IndexWithKey);
  }

  public static parse(value: string): DataPathElement {
    if (value === DataPathElement.SpecialName.Key) {
      return DataPathElement.key;
    } else if (isUnsignedIntegerString(value)) {
      return new DataPathElement(value, DataPathElement.Type.Both);
    } else {
      return new DataPathElement(value, DataPathElement.Type.MapKey);
    }
  }

  public static variable(path: DataPath): DataPathElement {
    return new DataPathElement(path, DataPathElement.Type.Variable);
  }

  public constructor(value: any, type: DataPathElement.Type) {
    super({ _value: value, _type: type });
  }

  public get asMapKey(): string {
    switch (this._type) {
      case DataPathElement.Type.MapKey:
      case DataPathElement.Type.Both:
        return this._value;
      case DataPathElement.Type.IndexWithKey:
        const key = (<IndexWithKey> this._value).key;
        if (key) {
          return key;
        } else {
          throw new Error('This cannot be map key');
        }
      default:
        throw new Error('This cannot be map key');
    }
  }

  public get asMapKeyOrUndefined(): string | undefined {
    return this.canBeMapKey ? this.asMapKey : undefined;
  }

  public get scalarValue(): string | number | symbol | undefined {
    switch (this._type) {
      case DataPathElement.Type.MapKey:
      case DataPathElement.Type.Both:
      case DataPathElement.Type.ListIndex:
        return this._value;
      case DataPathElement.Type.IndexWithKey:
        return this._value.value;
      case DataPathElement.Type.Key:
        return DataPathElement.keySymbol;
      default:
        return undefined;
    }
  }

  public get asListIndex(): number {
    switch (this._type) {
      case DataPathElement.Type.ListIndex:
        return this._value as number;
      case DataPathElement.Type.Both:
        return parseInt(this._value, 10);
      case DataPathElement.Type.IndexWithKey:
        return (<IndexWithKey> this._value).index;
      default:
        throw new Error('This cannot be list index');
    }
  }

  public get asListIndexOrUndefined(): number | undefined {
    return this.canBeListIndex ? this.asListIndex : undefined;
  }

  public asCollectionIndex(prioritizeListIndex?: boolean): CollectionIndex {
    switch (this._type) {
      case DataPathElement.Type.MapKey:
      case DataPathElement.Type.ListIndex:
        return this._value as CollectionIndex;
      case DataPathElement.Type.Both:
        return prioritizeListIndex ? Number(this._value) : this._value;
      case DataPathElement.Type.IndexWithKey:
        if (prioritizeListIndex) {
          return (<IndexWithKey> this._value).index;
        } else {
          const key = (<IndexWithKey> this._value).key;
          if (key) {
            return key;
          } else {
            throw new Error('This cannot be map key');
          }
        }
      default:
        throw new Error('This cannot be Collection index');
    }
  }

  public toString(): string {
    return this._value !== undefined ? this._value.toString() : '???';
  }

  public get canBeMapKey(): boolean {
    return this._type === DataPathElement.Type.MapKey ||
      this._type === DataPathElement.Type.Both ||
      (this._type === DataPathElement.Type.IndexWithKey && !!(<IndexWithKey> this._value).key);
  }

  public get canBeListIndex(): boolean {
    return this._type === DataPathElement.Type.ListIndex ||
      this._type === DataPathElement.Type.Both ||
      this._type === DataPathElement.Type.IndexWithKey;
  }

  public canBeCollectionIndex(prioritizeListIndex?: boolean): boolean {
    if (prioritizeListIndex) {
      return this.canBeListIndex || this._type === DataPathElement.Type.MapKey;
    } else {
      return this.canBeMapKey || this._type === DataPathElement.Type.ListIndex;
    }
  }

  public get isKey(): boolean {
    return this._type === DataPathElement.Type.Key;
  }

  public get isWildCard(): boolean {
    return this._type === DataPathElement.Type.WildCard;
  }

  public get isLast(): boolean {
    return this._type === DataPathElement.Type.Last;
  }

  public get isFirst(): boolean {
    return this._type === DataPathElement.Type.First;
  }

  public get isIndexWithKey(): boolean {
    return this._type === DataPathElement.Type.IndexWithKey;
  }

  public get isListIndex(): boolean {
    return this._type === DataPathElement.Type.ListIndex;
  }
}

namespace DataPathElement {
  export const keySymbol = Symbol('key');

  export enum Type {
    None,
    MapKey,
    ListIndex,
    Both,
    IndexWithKey,
    First,
    Last,
    Key,
    WildCard,
    Variable
  }
  export const key = new DataPathElement(undefined, DataPathElement.Type.Key);
  export const first = new DataPathElement(undefined, DataPathElement.Type.First);
  export const last = new DataPathElement(undefined, DataPathElement.Type.Last);
  export const wildCard = new DataPathElement(undefined, DataPathElement.Type.WildCard);
}

export default DataPathElement;
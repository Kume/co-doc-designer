import { isUnsignedIntegerString } from '../../../common/util';
import DataPath from './DataPath';
import { Record, Map, List } from 'immutable';
import { CollectionIndex, default as DataModelBase } from '../DataModelBase';

export type DataPathElementSource = string | number | symbol;
export type DataPathElementCompatible = DataPathElementSource | DataPathElement;

export interface DataPathElementMetadata extends Map<string, any> {
  set(key: 'keyOrder', value: List<string>): this;
  get(key: 'keyOrder'): List<string> | undefined;

  set(key: 'defaultData', value: DataModelBase): this;
  get(key: 'defaultData'): DataModelBase | undefined;
}

const defaultMetadata: DataPathElementMetadata = Map();
const DataPathElementRecord = Record({
  _type: 0,
  _value: null,
  metadata: defaultMetadata
});

class DataPathElement extends DataPathElementRecord {
  public static readonly SpecialName = {
    Key: '$key'
  };

  get type(): DataPathElement.Type {
    return this._type;
  }

  public readonly metadata: DataPathElementMetadata;
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
      if (value === '..') {
        return DataPathElement.reverse;
      } else {
        return new DataPathElement(value, DataPathElement.Type.MapKey);
      }
    } else {
      throw new Error();
    }
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
      default:
        throw new Error('This cannot be Collection index');
    }
  }

  public asCollectionIndexOrUndefined(prioritizeListIndex?: boolean): CollectionIndex | undefined {
    switch (this._type) {
      case DataPathElement.Type.MapKey:
      case DataPathElement.Type.ListIndex:
        return this._value as CollectionIndex;
      case DataPathElement.Type.Both:
        return prioritizeListIndex ? Number(this._value) : this._value;
      default:
        return undefined;
    }
  }

  public toString(): string {
    switch (this._type) {
      case DataPathElement.Type.Reverse:
        return '..';
      case DataPathElement.Type.Key:
        return '$key';
      case DataPathElement.Type.ListIndex:
      case DataPathElement.Type.MapKey:
      case DataPathElement.Type.Both:
        return this._value.toString();
      case DataPathElement.Type.WildCard:
        return typeof this._value === 'string' ? this._value : '*';
      default:
        return '???';
    }
  }

  public get canBeMapKey(): boolean {
    return this._type === DataPathElement.Type.MapKey ||
      this._type === DataPathElement.Type.Both;
  }

  public get canBeListIndex(): boolean {
    return this._type === DataPathElement.Type.ListIndex ||
      this._type === DataPathElement.Type.Both;
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

  public get isListIndex(): boolean {
    return this._type === DataPathElement.Type.ListIndex;
  }

  public get isReverse(): boolean {
    return this._type === DataPathElement.Type.Reverse;
  }

  public setMetadata(metadata: DataPathElementMetadata): this {
    return this.set('metadata', metadata) as this;
  }
}

namespace DataPathElement {
  export const keySymbol = Symbol('key');

  export enum Type {
    MapKey,
    ListIndex,
    Both,
    Key,
    WildCard,
    Variable,
    Reverse
  }
  export const key = new DataPathElement(undefined, DataPathElement.Type.Key);
  export const wildCard = new DataPathElement(undefined, DataPathElement.Type.WildCard);
  export const reverse = new DataPathElement(undefined, DataPathElement.Type.Reverse);
}

export default DataPathElement;
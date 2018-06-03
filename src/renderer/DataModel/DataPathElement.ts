import { isUnsignedIntegerString } from '../../common/util';
import DataPath from './DataPath';

export type DataPathElementSource = string | number;
export type DataPathElementCompatible = DataPathElementSource | DataPathElement;

class DataPathElement {
  public static readonly SpecialName = {
    Key: '$key'
  };

  get type(): DataPathElement.Type {
    return this._type;
  }

  private _value: any;
  private _type: DataPathElement.Type;

  public static create(value: DataPathElementCompatible): DataPathElement {
    if (value instanceof DataPathElement) {
      return value;
    } else if (typeof value === 'number') {
      return new DataPathElement(value, DataPathElement.Type.ListIndex);
    } else {
      return new DataPathElement(value, DataPathElement.Type.MapKey);
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
    this._value = value;
    this._type = type;
  }

  public get asMapKey(): string {
    switch (this._type) {
      case DataPathElement.Type.MapKey:
        return this._value as string;
      case DataPathElement.Type.Both:
        return this._value;
      default:
        throw new Error('This cannot be map key');
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

  public toString(): string {
    return this._value ? this._value.toString() : "???";
  }

  public get canBeMapKey(): boolean {
    return this._type === DataPathElement.Type.MapKey || this._type === DataPathElement.Type.Both;
  }

  public get canBeListIndex(): boolean {
    return this._type === DataPathElement.Type.ListIndex || this._type === DataPathElement.Type.Both;
  }

  public get isKey(): boolean {
    return this._type === DataPathElement.Type.Key;
  }

  public get isWildCard(): boolean {
    return this._type === DataPathElement.Type.WildCard;
  }

  public get isAfter(): boolean {
    return this._type === DataPathElement.Type.After;
  }

  public get isBefore(): boolean {
    return this._type === DataPathElement.Type.Before;
  }
}

namespace DataPathElement {
  export enum Type {
    None,
    MapKey,
    ListIndex,
    Both,
    Before,
    After,
    Key,
    WildCard,
    Variable
  }
  export const key = new DataPathElement(undefined, DataPathElement.Type.Key);
  export const before = new DataPathElement(undefined, DataPathElement.Type.Before);
  export const after = new DataPathElement(undefined, DataPathElement.Type.After);
  export const wildCard = new DataPathElement(undefined, DataPathElement.Type.WildCard);
}

export default DataPathElement;
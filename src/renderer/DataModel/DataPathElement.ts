import { isUnsignedIntegerString } from '../../common/util';

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
    } else if (typeof value === 'string') {
      return new DataPathElement(value, DataPathElement.Type.MapKey);
    }
    throw new Error();
  }

  public static parse(value: string): DataPathElement {
    if (value === DataPathElement.SpecialName.Key) {
      return new DataPathElement('', DataPathElement.Type.Key);
    } else if (isUnsignedIntegerString(value)) {
      return new DataPathElement(value, DataPathElement.Type.Both);
    } else {
      return new DataPathElement(value, DataPathElement.Type.MapKey);
    }
  }

  public constructor(value: any, type: DataPathElement.Type) {
    this._value = value;
    this._type = type;
  }

  public get getMapKey(): string {
    switch (this._type) {
      case DataPathElement.Type.MapKey:
        return this._value as string;
      case DataPathElement.Type.Both:
        return this._value;
      default:
        throw new Error('This cannot be map key');
    }
  }

  public get toListIndex(): number {
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
    return this._value.toString();
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
}

namespace DataPathElement {
  export enum Type {
    None,
    MapKey,
    ListIndex,
    Both,
    Key
  }
}

export default DataPathElement;
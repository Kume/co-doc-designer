import DataPathElement from '../DataModel/Path/DataPathElement';

export default abstract class UIDefinitionBase {
  public readonly keyFlatten: boolean = false;
  protected readonly _key?: DataPathElement;
  private readonly _label: string;

  public constructor(label?: string, key?: string) {
    this._label = label || '';
    this._key = key === undefined ? undefined : DataPathElement.parse(key);
  }

  public get label(): string {
    return this._label;
  }

  get key(): DataPathElement | undefined {
    return this._key;
  }

  get keyString(): string {
    if (this.key === undefined) {
      throw new Error();
    }
    return this.key.asMapKey;
  }
}

export interface StrictKeyedUIDefinition extends UIDefinitionBase {
  key: DataPathElement;
}

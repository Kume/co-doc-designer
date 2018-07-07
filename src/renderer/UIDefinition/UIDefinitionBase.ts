import DataPathElement from '../DataModel/Path/DataPathElement';

export default abstract class UIDefinitionBase {
  public readonly keyFlatten: boolean = false;
  protected readonly _key: DataPathElement;
  private readonly _label: string;

  public constructor(label: string, key: DataPathElement) {
    this._label = label;
    this._key = key;
  }

  public get label(): string {
    return this._label;
  }

  get key(): DataPathElement {
    return this._key;
  }
}

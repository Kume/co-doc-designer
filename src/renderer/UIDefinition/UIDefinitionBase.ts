import DataPathElement from '../DataModel/Path/DataPathElement';

export default abstract class UIDefinitionBase {
  public readonly keyFlatten: boolean = false;
  protected readonly _key: DataPathElement;
  private readonly _title: string;

  public constructor(title: string, key: DataPathElement) {
    this._title = title;
    this._key = key;
  }

  public get title(): string {
    return this._title;
  }

  get key(): DataPathElement {
    return this._key;
  }
}

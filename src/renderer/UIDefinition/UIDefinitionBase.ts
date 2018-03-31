import DataPathElement from '../DataModel/DataPathElement';

export default abstract class UIDefinitionBase {
  private _title: string;
  private _key: DataPathElement;

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

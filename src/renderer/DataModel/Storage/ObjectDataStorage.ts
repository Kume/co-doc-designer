import DataStorage from './DataStorage';

export default class ObjectDataStorage implements DataStorage {
  get data(): Object {
    return this._data;
  }
  private _data: Object = {};
  public async saveAsync(paths: Array<string>, content: string): Promise<void> {
    this._data[paths.join('/')] = content;
  }

  public async loadAsync(paths: Array<string>): Promise<string> {
    return this._data[paths.join('/')];
  }
}
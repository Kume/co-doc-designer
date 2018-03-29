import DataStorage from './DataStorage';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export default class FileDataStorage implements DataStorage {
  private _rootPath: string;
  constructor(rootPath: string) {
    this._rootPath = rootPath;
  }

  public async saveAsync(paths: Array<string>, content: string): Promise<void> {
    const filePath = path.join(this._rootPath, ...paths);
    await writeFile(filePath, content);
  }

  public async loadAsync(paths: Array<string>): Promise<string> {
    const filePath = path.join(this._rootPath, ...paths);
    const content = await readFile(filePath);
    return content.toString();
  }
}
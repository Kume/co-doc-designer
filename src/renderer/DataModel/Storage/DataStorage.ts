export default interface DataStorage {
  saveAsync(paths: Array<string>, content: string): Promise<void>;
  loadAsync(paths: Array<string>): Promise<string>;
  exists(paths: Array<string>): Promise<boolean>;
}
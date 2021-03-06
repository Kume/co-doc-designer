import DataStorage from './DataStorage';
import DataModelBase from '../DataModelBase';
import DataPath from '../Path/DataPath';
import { DataFormatter } from './DataFormatter';
import YamlDataFormatter from './YamlDataFormatter';
import MapDataModel from '../MapDataModel';
import { StringDataModel } from '../ScalarDataModel';
import DataModelFactory from '../DataModelFactory';
import { SetDataAction } from '../DataAction';

abstract class MappingNodeBase {
  protected path: DataPath;
  protected childConfigs: Array<MappingNode> = [];

  constructor (path: DataPath) {
    this.path = path;
  }

  public addChild(child: MappingNode) {
    this.childConfigs.push(child);
  }

  protected async saveChildrenAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>,
    specifiedDirectory: Array<string>
  ): Promise<DataModelBase> {
    for (const config of this.childConfigs) {
      data = await config.saveAsync(data, storage, formatter, parentPath, parentDirectory, specifiedDirectory);
    }
    return data;
  }

  protected async loadChildrenAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>
  ): Promise<DataModelBase> {
    for (const config of this.childConfigs) {
      data = await config.loadAsync(data, storage, formatter, parentPath, parentDirectory);
    }
    return data;
  }
}

abstract class MappingNode extends MappingNodeBase {
  protected _directoryPath: Array<string>;

  public constructor(path: DataPath, directoryPath: Array<string>) {
    super(path);
    this._directoryPath = directoryPath;
  }

  public abstract saveAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>,
    specifiedDirectory: Array<string>
  ): Promise<DataModelBase>;

  public abstract loadAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>
  ): Promise<DataModelBase>;
}

class MapMappingNode extends MappingNode {
  public async saveAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>,
    specifiedDirectory: Array<string>
  ): Promise<DataModelBase> {
    const basePath = parentPath.concat(this.path);
    const mapData = data.getValue(basePath);
    if (mapData instanceof MapDataModel) {
      for (const mapElement of mapData.list.toArray()) {
        if (mapElement.key) {
          const key: string = mapElement.key;
          const directoryPath = parentDirectory.concat(this._directoryPath);
          const filename = key + '.yml';
          const filePath = specifiedDirectory.concat(this._directoryPath).concat([filename]).join('/');
          const path = basePath.push(mapElement.key);
          data = await this.saveChildrenAsync(
            data, storage, formatter, path, directoryPath.concat([key]), [key]);
          await storage.saveAsync(
            directoryPath.concat([filename]),
            formatter.format(data.getValue(path)!.toJsonObject()));
          data = data.applyAction(path, <SetDataAction> {type: 'Set', data: StringDataModel.create(filePath)});
        }
      }
      return data;
    } else {
      throw new Error();
    }
  }

  public async loadAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>
  ): Promise<DataModelBase> {
    const basePath = parentPath.concat(this.path);
    const mapData = data.getValue(basePath) || MapDataModel.empty;
    if (mapData instanceof MapDataModel) {
      for (const mapElement of mapData.list.toArray()) {
        if (mapElement.key) {
          const key: string = mapElement.key;
          const directoryPath = parentDirectory.concat(this._directoryPath);
          const filename = key + '.yml';
          // const filePath = this._directoryPath.concat([filename]).join('/');
          const path = basePath.push(mapElement.key);
          const source = await storage.loadAsync(directoryPath.concat([filename]));
          const formated = formatter.parse(source);
          const loaded = DataModelFactory.create(formated);
          data = data.applyAction(path, <SetDataAction> {type: 'Set', data: loaded});
          data = await this.loadChildrenAsync(
            data, storage, formatter, path, directoryPath.concat([key]));
        }
      }
      return data;
    } else {
      throw new Error();
    }
  }
}

interface DataMapperNodeConfig {
  type: string;
  path: string;
  directory?: string;
  fileName?: string;
  children?: Array<DataMapperNodeConfig>;
}

export class SingleMappingNode extends MappingNode {
  private _fileName: string;

  public constructor(path: DataPath, directoryPath: Array<string>, fileName: string) {
    super(path, directoryPath);
    this._fileName = fileName;
  }

  public async saveAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>,
    specifiedDirectory: Array<string>
  ): Promise<DataModelBase> {
    const path = parentPath.concat(this.path);
    data = await this.saveChildrenAsync(
      data, storage, formatter, path, parentDirectory.concat(this._directoryPath), []);
    const value = data.getValue(path);
    if (value) {
      await storage.saveAsync(
        parentDirectory.concat(this._directoryPath).concat([this._fileName]),
        formatter.format(value.toJsonObject()));
      const filePathData = StringDataModel.create(specifiedDirectory.concat([this._fileName]).join('/'));
      return data.applyAction(path, <SetDataAction> {type: 'Set', data: filePathData});
    } else {
      return data;
    }
  }

  public async loadAsync(
    data: DataModelBase,
    storage: DataStorage,
    formatter: DataFormatter,
    parentPath: DataPath,
    parentDirectory: Array<string>
  ): Promise<DataModelBase> {
    const path = parentPath.concat(this.path);
    const value = data.getValue(path);
    if (value) {
      const source = await storage.loadAsync(
        parentDirectory.concat(this._directoryPath).concat([this._fileName]));
      const formated = formatter.parse(source);
      const loaded = DataModelFactory.create(formated);
      return data.applyAction(path, <SetDataAction> {type: 'Set', data: loaded});
    } else {
      return data;
    }
  }
}

export interface DataMapperConfig {
  children: Array<DataMapperNodeConfig>;
}

export default class DataMapper extends MappingNodeBase {
  private storage: DataStorage;
  private formatter: DataFormatter;
  private indexFileName: string = 'index.yml';

  public static build(
    config: DataMapperConfig | undefined,
    storage: DataStorage,
    formatter: DataFormatter = new YamlDataFormatter()
  ): DataMapper {
    const mapper = new DataMapper(storage, formatter);
    if (config) {
      this._build(config.children || [], mapper);
    }
    return mapper;
  }

  private static _build(configs: Array<DataMapperNodeConfig>, parent: MappingNodeBase) {
    configs.forEach((config: DataMapperNodeConfig) => {
      switch (config.type) {
        case 'single':
          const singleNode = new SingleMappingNode(
            new DataPath(config.path === '' ? [] : config.path.split('.')),
            [],
            config.fileName!
          );
          this._build(config.children || [], singleNode);
          parent.addChild(singleNode);
          break;

        case 'map':
          const mapNode = new MapMappingNode(
            new DataPath(config.path === '' ? [] : config.path.split('.')),
            config.directory === '' || !config.directory ? [] : config.directory.split('/')
          );
          this._build(config.children || [], mapNode);
          parent.addChild(mapNode);
          break;

        default:
          throw new Error();
      }
    });
  }

  constructor(storage: DataStorage, formatter: DataFormatter = new YamlDataFormatter()) {
    super(new DataPath([]));
    this.storage = storage;
    this.formatter = formatter;
  }

  public async saveAsync(data: DataModelBase): Promise<void> {
    data = await this.saveChildrenAsync(data, this.storage, this.formatter, this.path, [], []);
    await this.storage.saveAsync([this.indexFileName], this.formatter.format(data.toJsonObject()));
  }

  public async loadAsync(): Promise<DataModelBase | undefined> {
    if (!await this.storage.exists(['index.yml'])) {
      return undefined;
    }
    const source = await this.storage.loadAsync(['index.yml']);
    const formatted = this.formatter.parse(source);
    let loaded = DataModelFactory.create(formatted);
    loaded = await this.loadChildrenAsync(loaded, this.storage, this.formatter, this.path, []);
    return loaded;
  }
}
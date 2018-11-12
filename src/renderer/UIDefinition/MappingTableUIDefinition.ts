import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import { AnyDataSchema } from '../DataSchema';
import { MappingTableUIDefinitionConfig } from './UIDefinitionConfig';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import DataPath from '../DataModel/Path/DataPath';
import ConfigError from '../../common/Error/ConfigError';
import MapDataModel from '../DataModel/MapDataModel';
import { CollectionDataModel } from '../DataModel/DataModelBase';

export default class MappingTableUIDefinition extends MultiContentsUIDefinition {
  public readonly sourcePath: DataPath;

  public constructor(config: MappingTableUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);
    this.sourcePath = DataPath.parse(config.sourcePath);
    if (dataSchema) {
      if (dataSchema.type === 'map') {
        const { item } = dataSchema;
        if (item.type === 'fixed_map') {
          for (const child of config.contents || []) {
            this.addContent(UIDefinitionFactory.create(child, item.items.get(child.key!)));
          }
        } else {
          throw new ConfigError('invalid type of data schema for TableUIDefinition children');
        }
      } else {
        throw new ConfigError('invalid type of data schema for TableUIDefinition');
      }
    } else {
      for (const child of config.contents || []) {
        this.addContent(UIDefinitionFactory.create(child));
      }
    }
  }

  public get defaultData(): MapDataModel {
    return MapDataModel.empty;
  }

  public get defaultRowData(): CollectionDataModel {
    return MapDataModel.empty;
  }
}

UIDefinitionFactory.register('mappingTable', MappingTableUIDefinition);

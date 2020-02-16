import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import { AnyDataSchema } from '../DataSchema';
import UIDefinitionConfig, { MappingTableUIDefinitionConfig } from './UIDefinitionConfig';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import DataPath from '../DataModel/Path/DataPath';
import ConfigError from '../../common/Error/ConfigError';
import MapDataModel from '../DataModel/MapDataModel';
import { CollectionDataModel } from '../DataModel/DataModelBase';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export default class MappingTableUIDefinition extends MultiContentsUIDefinition {
  public readonly sourcePath: DataPath;

  public constructor(
    config: MappingTableUIDefinitionConfig,
    namedConfig: NamedItemManager<UIDefinitionConfig>,
    dataSchema?: AnyDataSchema
  ) {
    super(config, namedConfig, dataSchema);
    this.sourcePath = DataPath.parse(config.sourcePath, []);
    if (dataSchema) {
      if (dataSchema.type === 'map') {
        const { item } = dataSchema;
        if (item.type === 'fixed_map') {
          for (const content of config.contents || []) {
            const [child, childNamedConfig] = namedConfig.resolve(content);
            this.addContent(UIDefinitionFactory.create(child, childNamedConfig, item.items.get(child.key!)));
          }
        } else {
          throw new ConfigError('invalid type of data schema for TableUIDefinition children');
        }
      } else {
        throw new ConfigError('invalid type of data schema for TableUIDefinition');
      }
    } else {
      for (const child of config.contents || []) {
        this.addContent(UIDefinitionFactory.create(...namedConfig.resolve(child)));
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

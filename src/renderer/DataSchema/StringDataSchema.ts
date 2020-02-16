import DataSchema, { DataSchemaConfig } from './DataSchema';
import {
  parseOptionsConfig,
  SelectDynamicOption,
  SelectStaticOption
} from '../common/commonConfig';
import { DataSchemaFactory } from './DataSchemaFactory';
import { SelectOptionConfig } from '../UIDefinition/UIDefinitionConfig';
import { DataContext } from '../DataModel/DataContext';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

type dataType = 'string';

export interface StringDataSchemaConfig extends DataSchemaConfig {
  type: dataType;
  in?: SelectOptionConfig;
}

export class StringDataSchema extends DataSchema {
  public readonly type: dataType;
  public readonly in?: Array<SelectStaticOption | SelectDynamicOption>;

  public constructor(
    config: StringDataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ) {
    super(config, namedSchemaManager, context);
    if (config.in) { this.in = parseOptionsConfig(config.in, this.context); }
  }
}

DataSchemaFactory.register('string', StringDataSchema);

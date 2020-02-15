import DataSchema, { DataSchemaConfig } from './DataSchema';
import {
  parseOptionsConfig,
  SelectDynamicOption,
  SelectStaticOption
} from '../common/commonConfig';
import { DataSchemaFactory } from './DataSchemaFactory';
import { SelectOptionConfig } from '../UIDefinition/UIDefinitionConfig';
import { DataContext } from '../DataModel/DataContext';

type dataType = 'string';

export interface StringDataSchemaConfig extends DataSchemaConfig {
  type: dataType;
  in?: SelectOptionConfig;
}

export class StringDataSchema extends DataSchema {
  public readonly type: dataType;
  public readonly in?: Array<SelectStaticOption | SelectDynamicOption>;

  public constructor(config: StringDataSchemaConfig, context: readonly DataContext[]) {
    super(config, context);
    if (config.in) { this.in = parseOptionsConfig(config.in, this.context); }
  }
}

DataSchemaFactory.register('string', StringDataSchema);

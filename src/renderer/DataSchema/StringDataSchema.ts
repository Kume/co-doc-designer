import DataSchema, { DataSchemaConfig } from './DataSchema';
import {
  parseOptionsConfig,
  SelectDynamicOption,
  SelectOptionConfig,
  SelectStaticOption
} from '../common/commonConfig';
import { DataSchemaFactory } from './DataSchemaFactory';

type dataType = 'string';

export interface StringDataSchemaConfig extends DataSchemaConfig {
  type: dataType;
  in?: SelectOptionConfig;
}

export class StringDataSchema extends DataSchema {
  public readonly type: dataType;
  public readonly in?: Array<SelectStaticOption | SelectDynamicOption>;

  public constructor(config: StringDataSchemaConfig) {
    super(config);
    if (config.in) { this.in = parseOptionsConfig(config.in); }
  }
}

DataSchemaFactory.register('string', StringDataSchema);

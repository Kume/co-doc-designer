import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';

export interface BooleanDataSchemaConfig extends DataSchemaConfig {

}

export default class BooleanDataSchema extends DataSchema {
  public readonly type: 'boolean';

  constructor(config: BooleanDataSchemaConfig) {
    super(config);
  }
}

DataSchemaFactory.register('boolean', BooleanDataSchema);
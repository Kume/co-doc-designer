import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';

export interface NumberDataSchemaConfig extends DataSchemaConfig {

}

export default class NumberDataSchema extends DataSchema {
  public readonly type: 'number';

  constructor(config: NumberDataSchemaConfig) {
    super(config);
  }
}

DataSchemaFactory.register('number', NumberDataSchema);
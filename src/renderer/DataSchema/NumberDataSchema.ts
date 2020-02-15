import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { DataContext } from '../DataModel/DataContext';

export interface NumberDataSchemaConfig extends DataSchemaConfig {

}

export default class NumberDataSchema extends DataSchema {
  public readonly type: 'number';

  constructor(config: NumberDataSchemaConfig, context: readonly DataContext[]) {
    super(config, context);
  }
}

DataSchemaFactory.register('number', NumberDataSchema);
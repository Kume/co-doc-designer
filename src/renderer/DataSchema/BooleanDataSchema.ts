import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { DataContext } from '../DataModel/DataContext';

export interface BooleanDataSchemaConfig extends DataSchemaConfig {

}

export default class BooleanDataSchema extends DataSchema {
  public readonly type: 'boolean';

  constructor(config: BooleanDataSchemaConfig, context: readonly DataContext[]) {
    super(config, context);
  }
}

DataSchemaFactory.register('boolean', BooleanDataSchema);
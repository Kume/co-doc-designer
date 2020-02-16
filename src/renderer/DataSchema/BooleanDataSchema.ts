import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { DataContext } from '../DataModel/DataContext';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export interface BooleanDataSchemaConfig extends DataSchemaConfig {

}

export default class BooleanDataSchema extends DataSchema {
  public readonly type: 'boolean';

  constructor(
    config: BooleanDataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ) {
    super(config, namedSchemaManager, context);
  }
}

DataSchemaFactory.register('boolean', BooleanDataSchema);
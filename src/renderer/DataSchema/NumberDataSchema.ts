import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { DataContext } from '../DataModel/DataContext';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export interface NumberDataSchemaConfig extends DataSchemaConfig {

}

export default class NumberDataSchema extends DataSchema {
  public readonly type: 'number';

  constructor(
    config: NumberDataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ) {
    super(config, namedSchemaManager, context);
  }
}

DataSchemaFactory.register('number', NumberDataSchema);
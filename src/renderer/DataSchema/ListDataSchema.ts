import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';
import { DataContext } from '../DataModel/DataContext';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export interface ListDataSchemaConfig extends DataSchemaConfig {
  type: 'list';
  item: DataSchemaConfig | string;
}

export default class ListDataSchema extends DataSchema {
  public readonly type: 'list';
  public readonly item: AnyDataSchema;

  constructor(
    config: ListDataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ) {
    super(config, namedSchemaManager, context);
    if (typeof config.item === 'string') {
      this.item = DataSchemaFactory.create(
        namedSchemaManager.get(config.item), namedSchemaManager.digForGetKey(config.item), this.context);
    } else {
      this.item = DataSchemaFactory.create(config.item, namedSchemaManager, this.context);
    }
  }
}

DataSchemaFactory.register('list', ListDataSchema);

import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';
import { DataContext } from '../DataModel/DataContext';

export interface ListDataSchemaConfig extends DataSchemaConfig {
  type: 'list';
  item: DataSchemaConfig;
}

export default class ListDataSchema extends DataSchema {
  public readonly type: 'list';
  public readonly item: AnyDataSchema;

  constructor(config: ListDataSchemaConfig, context: readonly DataContext[]) {
    super(config, context);
    this.item = DataSchemaFactory.create(config.item, this.context);
  }
}

DataSchemaFactory.register('list', ListDataSchema);

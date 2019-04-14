import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';
import { SelectDynamicOption, SelectStaticOption } from '../common/commonConfig';

export interface ListDataSchemaConfig extends DataSchemaConfig {
  type: 'list';
  item: DataSchemaConfig;
}

export default class ListDataSchema extends DataSchema {
  public readonly type: 'list';
  public readonly item: AnyDataSchema;

  constructor(config: ListDataSchemaConfig) {
    super(config);
    this.item = DataSchemaFactory.create(config.item);
  }
}

DataSchemaFactory.register('list', ListDataSchema);

import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';
import { DataContext } from '../DataModel/DataContext';

export interface MapDataSchemaConfig extends DataSchemaConfig {
  type: 'map';
  item: DataSchemaConfig;
}

export default class MapDataSchema extends DataSchema {
  public readonly type: 'map';
  public readonly item: AnyDataSchema;

  public constructor(config: MapDataSchemaConfig, context: readonly DataContext[]) {
    super(config, context);

    this.item = DataSchemaFactory.create(config.item, this.context);
  }
}

DataSchemaFactory.register('map', MapDataSchema);

import DataSchema, { DataSchemaConfig } from './DataSchema';
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';

export interface MapDataSchemaConfig extends DataSchemaConfig {
  type: 'map';
  item: DataSchemaConfig;
}

export default class MapDataSchema extends DataSchema {
  public readonly type: 'map';
  public readonly item: AnyDataSchema;

  public constructor(config: MapDataSchemaConfig) {
    super(config);

    this.item = DataSchemaFactory.create(config.item);
  }
}

DataSchemaFactory.register('map', MapDataSchema);

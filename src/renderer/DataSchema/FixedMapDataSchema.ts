import DataSchema, { DataSchemaConfig } from './DataSchema';
import _ = require('underscore');
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';

export interface FixedMapDataSchemaConfig extends DataSchemaConfig {
  type: 'fixed_map';
  items: { [key: string]: DataSchemaConfig };
}

export default class FixedMapDataSchema extends DataSchema {
  public readonly type: 'fixed_map';
  public readonly items: ReadonlyMap<string, AnyDataSchema>;

  public constructor(config: FixedMapDataSchemaConfig) {
    super(config);

    const items: Map<string, AnyDataSchema> = new Map();
    _.forEach(config.items, (item, key) => {
      items.set(key, DataSchemaFactory.create(item));
    });

    this.items = items;
  }
}

DataSchemaFactory.register('fixed_map', FixedMapDataSchema);
import DataSchema, { DataSchemaConfig } from './DataSchema';
import _ = require('underscore');
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';
import { DataContext } from '../DataModel/DataContext';

export interface FixedMapDataSchemaConfig extends DataSchemaConfig {
  type: 'fixed_map';
  items: { [key: string]: DataSchemaConfig };
}

export default class FixedMapDataSchema extends DataSchema {
  public readonly type: 'fixed_map';
  public readonly items: ReadonlyMap<string, AnyDataSchema>;

  public constructor(config: FixedMapDataSchemaConfig, context: readonly DataContext[]) {
    super(config, context);

    const items: Map<string, AnyDataSchema> = new Map();
    _.forEach(config.items, (item, key) => {
      items.set(key, DataSchemaFactory.create(item, this.context));
    });

    this.items = items;
  }
}

DataSchemaFactory.register('fixed_map', FixedMapDataSchema);
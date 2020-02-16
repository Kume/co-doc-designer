import DataSchema, { DataSchemaConfig } from './DataSchema';
import _ = require('underscore');
import { DataSchemaFactory } from './DataSchemaFactory';
import { AnyDataSchema } from './index';
import { DataContext } from '../DataModel/DataContext';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export interface FixedMapDataSchemaConfig extends DataSchemaConfig {
  type: 'fixed_map';
  items: { [key: string]: DataSchemaConfig | string };
}

export default class FixedMapDataSchema extends DataSchema {
  public readonly type: 'fixed_map';
  public readonly items: ReadonlyMap<string, AnyDataSchema>;

  public constructor(
    config: FixedMapDataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ) {
    super(config, namedSchemaManager, context);

    const items: Map<string, AnyDataSchema> = new Map();
    _.forEach(config.items, (item, key) => {
      if (typeof item === 'string') {
        items.set(key, DataSchemaFactory.create(
          namedSchemaManager.get(item), namedSchemaManager.digForGetKey(item), this.context));
      } else {
        items.set(key, DataSchemaFactory.create(item, namedSchemaManager, this.context));
      }
    });

    this.items = items;
  }
}

DataSchemaFactory.register('fixed_map', FixedMapDataSchema);
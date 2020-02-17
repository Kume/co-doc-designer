import DataSchema, { ConditionalSchemaItem, ConditionConfig, DataSchemaConfig } from './DataSchema';
import { AnyDataSchema, DataSchemaFactory } from './index';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';
import { DataContext } from '../DataModel/DataContext';
import DataPath from '../DataModel/Path/DataPath';
import DataModelBase from '../DataModel/DataModelBase';
import DataModelFactory from '../DataModel/DataModelFactory';

export interface ConditionalDataSchemaItemConfig {
  condition: ConditionConfig;
  item: DataSchemaConfig | string;
}

export interface ConditionalDataSchemaConfig extends DataSchemaConfig {
  type: 'conditional';
  items: { [key: string]: ConditionalDataSchemaItemConfig };
}

function convertCondition(
  source: ConditionConfig, context: readonly DataContext[],
): ConditionConfig<DataPath, DataModelBase> {
  if ('match' in source) {
    return { match: DataModelFactory.create(source.match), path: DataPath.parse(source.path, context) };
  } else if ('or' in source) {
    return { or: source.or.map(i => convertCondition(i, context)) };
  } else if ('and' in source) {
    return { and: source.and.map(i => convertCondition(i, context)) };
  }
  throw new Error('Invalid condition');
}

export class ConditionalDataSchema extends DataSchema {
  public readonly type: 'conditional';
  public readonly items: { [key: string]: ConditionalSchemaItem<AnyDataSchema, DataModelBase> };

  public constructor(
    config: ConditionalDataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ) {
    super(config, namedSchemaManager, context);

    this.items = {};
    for (const key of Object.keys(config.items)) {
      const { item: sourceItem, condition } = config.items[key];
      const [item, childNamedManager] = namedSchemaManager.resolve(sourceItem);
      const childSchema = DataSchemaFactory.create(item, childNamedManager, this.context);
      this.items[key] = {
        condition: convertCondition(condition, this.context),
        item: childSchema
      };
    }
  }

  public get isVirtualNode(): boolean { return true; }
}

DataSchemaFactory.register('conditional', ConditionalDataSchema);

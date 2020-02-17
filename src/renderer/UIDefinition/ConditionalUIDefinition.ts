import { AnyDataSchema, ConditionalSchemaItem } from '../DataSchema';
import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfig, { ConditionalUIDefinitionConfig } from './UIDefinitionConfig';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import DataModelBase from '../DataModel/DataModelBase';

export class ConditionalUIDefinition extends UIDefinitionBase {
  public readonly contents: Array<ConditionalSchemaItem<UIDefinitionBase, DataModelBase>>;

  public constructor(
    config: ConditionalUIDefinitionConfig,
    namedConfig: NamedItemManager<UIDefinitionConfig>,
    dataSchema?: AnyDataSchema
  ) {
    super(config, namedConfig, dataSchema);

    this.contents = [];
    if (dataSchema?.type === 'conditional') {
      for (const key of Object.keys(config.conditionalContents)) {
        if (!dataSchema.items[key]) {
          throw new Error(`matched schema for key ${key} not found. @ConditionalUIDefinition`);
        }
        const { condition, item: childSchema } = dataSchema.items[key];
        const [child, childNamedConfig] = namedConfig.resolve(config.conditionalContents[key]);
        const childDefinition = UIDefinitionFactory.create(child, childNamedConfig, childSchema);
        this.contents.push({ condition, item: childDefinition });
      }
    } else {
      throw new Error(`invalid data schema ${dataSchema?.type} for ConditionalUIDefinition`);
    }
  }
}

UIDefinitionFactory.register('conditional', ConditionalUIDefinition);

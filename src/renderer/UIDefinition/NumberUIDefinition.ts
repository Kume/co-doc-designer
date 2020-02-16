import UIDefinitionConfig, { NumberUIDefinitionConfig } from './UIDefinitionConfig';
import UIDefinitionBase from './UIDefinitionBase';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export default class NumberUIDefinition extends UIDefinitionBase {
  public constructor(
    config: NumberUIDefinitionConfig,
    namedConfig: NamedItemManager<UIDefinitionConfig>,
    dataSchema?: AnyDataSchema
  ) {
    super(config, namedConfig, dataSchema);
    if (dataSchema) {
      if (dataSchema.type === 'number') {
        // 今の所何もしない
      } else {
        throw new ConfigError('invalid type of data schema for NumberUIDefinition');
      }
    }
  }
}

UIDefinitionFactory.register('number', NumberUIDefinition);
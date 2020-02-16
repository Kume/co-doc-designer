import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfig, { CheckBoxUIDefinitionConfig } from './UIDefinitionConfig';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export default class CheckBoxUIDefinition extends UIDefinitionBase {
  public constructor(
    config: CheckBoxUIDefinitionConfig,
    namedConfig: NamedItemManager<UIDefinitionConfig>,
    dataSchema?: AnyDataSchema
  ) {
    super(config, namedConfig, dataSchema);
    if (dataSchema) {
      if (dataSchema.type === 'boolean') {
        // 今の所何もしない
      } else {
        throw new ConfigError('invalid type of data schema for CheckBoxUIDefinition');
      }
    }
  }
}

UIDefinitionFactory.register('checkbox', CheckBoxUIDefinition);

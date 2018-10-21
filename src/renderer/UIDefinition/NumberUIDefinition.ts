import UIDefinitionConfig from './UIDefinitionConfig';
import UIDefinitionBase from './UIDefinitionBase';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';

export interface NumberUIDefinitionConfig extends UIDefinitionConfig {

}

export default class NumberUIDefinition extends UIDefinitionBase {
  public constructor(config: NumberUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);
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
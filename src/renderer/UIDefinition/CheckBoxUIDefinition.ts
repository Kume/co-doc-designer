import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfig from './UIDefinitionConfig';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';

export interface CheckBoxUIDefinitionConfig extends UIDefinitionConfig {

}

export default class CheckBoxUIDefinition extends UIDefinitionBase {
  public constructor(config: CheckBoxUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);
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

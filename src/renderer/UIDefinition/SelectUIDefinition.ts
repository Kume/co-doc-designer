import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfig from './UIDefinitionConfig';
import {
  parseOptionsConfig,
  SelectDynamicOption,
  SelectOptionConfig,
  SelectStaticOption
} from '../common/commonConfig';
import { AnyDataSchema } from '../DataSchema';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import ConfigError from '../../common/Error/ConfigError';

export interface SelectUIDefinitionConfig extends UIDefinitionConfig {
  emptyToNull: boolean;
  options?: SelectOptionConfig;
  isMulti?: boolean;
}

export default class SelectUIDefinition extends UIDefinitionBase {
  public readonly isMulti: boolean;
  private readonly _options: Array<SelectStaticOption | SelectDynamicOption>;

  public constructor(config: SelectUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);

    if (config.options) {
      this._options = parseOptionsConfig(config.options);
    } else {
      if (dataSchema) {
        if (dataSchema.type === 'string' && dataSchema.in) {
          this._options = dataSchema.in;
        }
      }
    }
    if (!this._options) {
      console.log(config, dataSchema);
      throw new ConfigError('options is not set for SelectUIDefinitionConfig');
    }
    this.isMulti = !!config.isMulti;
  }

  get options(): ReadonlyArray<SelectStaticOption | SelectDynamicOption> {
    return this._options;
  }
}

UIDefinitionFactory.register('select', SelectUIDefinition);
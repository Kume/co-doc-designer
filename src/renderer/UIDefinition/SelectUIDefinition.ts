import UIDefinitionBase from './UIDefinitionBase';
import { SelectUIDefinitionConfig } from './UIDefinitionConfig';
import { parseOptionsConfig, SelectDynamicOption, SelectStaticOption } from '../common/commonConfig';
import { AnyDataSchema } from '../DataSchema';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import ConfigError from '../../common/Error/ConfigError';

export default class SelectUIDefinition extends UIDefinitionBase {
  private static configsForItemSchema(schema: AnyDataSchema) {
    let options: ReadonlyArray<SelectStaticOption | SelectDynamicOption> | undefined;
    if (schema.type === 'string') {
      options = schema.in;
    } else if (schema.type === 'number' || schema.type === 'boolean') {
      // 今の所特になにもしない
    } else {
      throw new ConfigError(`Type ${schema.type} is invalid for select`);
    }
  }

  public readonly isMulti: boolean;
  public readonly options: ReadonlyArray<SelectStaticOption | SelectDynamicOption>;

  public constructor(config: SelectUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);

    let options: ReadonlyArray<SelectStaticOption | SelectDynamicOption> | undefined;
    if (dataSchema) {
      if (config.isMulti) {
        if (dataSchema.type === 'list') {
          if (dataSchema.item.type === 'string') {
            options = dataSchema.item.in;
          } else if (dataSchema.item.type === 'number' || dataSchema.item.type === 'boolean') {
            // 今の所特になにもしない
          } else {
            throw new ConfigError(`Type ${dataSchema.type} is invalid for select`);
          }
        } else {
          throw new ConfigError(`Type ${dataSchema.type} is invalid for multi select`);
        }
      } else {
        if (dataSchema.type === 'string') {
          options = dataSchema.in;
        } else if (dataSchema.type === 'number' || dataSchema.type === 'boolean') {
          // 今の所特になにもしない
        } else {
          throw new ConfigError(`Type ${dataSchema.type} is invalid for select`);
        }
      }
    }

    if (config.options) {
      options = parseOptionsConfig(config.options);
    } else {
      if (dataSchema) {
        if (dataSchema.type === 'string' && dataSchema.in) {
          options = dataSchema.in;
        }
      }
    }
    if (!options) {
      throw new ConfigError(`options is not set for SelectUIDefinitionConfig [${this.key} : ${this.label}]`);
    } else {
      this.options = options;
    }
    this.isMulti = !!config.isMulti;
  }
}

UIDefinitionFactory.register('select', SelectUIDefinition);
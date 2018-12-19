import UIDefinitionBase from './UIDefinitionBase';
import { TemplateReferencePathConfig, TextUIDefinitionConfig } from './UIDefinitionConfig';
import DataPath from '../DataModel/Path/DataPath';
import { TemplateLine } from '../Model/TemplateEngine';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';

export interface TemplateReference {
  readonly key: string;
  readonly name?: string;
  readonly paths: TemplateReferencePath[][];
}

export interface TemplateReferencePath {
  path: DataPath;
  keyPath: DataPath;
  description?: TemplateLine;
}

function pathItemConfigToDefinition(config: TemplateReferencePathConfig): TemplateReferencePath {
  return {
    path: DataPath.parse(config.path),
    keyPath: DataPath.parse(config.keyPath),
    description: config.description === undefined ? undefined : new TemplateLine(config.description)
  };
}

export default class TextUIDefinition extends UIDefinitionBase {
  public readonly multiline: boolean;
  public readonly options?: ReadonlyArray<string>;
  public readonly references?: ReadonlyArray<TemplateReference>;

  public constructor(config: TextUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);
    this.multiline = !!config.multiline;
    if (dataSchema) {
      if (dataSchema.type === 'string') {
        // 今の所何もしない
      } else {
        throw new ConfigError('invalid type of data schema for TextUIDefinition');
      }
    } else {
      this.options = config.options;
      this.references = config.references && Object.keys(config.references).map(key => {
        const reference = config.references![key];
        return {
          key,
          name: reference.name,
          paths: reference.paths.map(path => {
            if (Array.isArray(path)) {
              return path.map(pathItemConfigToDefinition);
            } else {
              return [pathItemConfigToDefinition(path)];
            }
          })
        };
      });
    }
  }
}

UIDefinitionFactory.register('text', TextUIDefinition);
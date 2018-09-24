import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPath from '../DataModel/Path/DataPath';
import { TemplateLine } from '../Model/TemplateEngine';

interface TemplateReferencePathConfig {
  path: string;
  keyPath: string;
  description?: string;
}

interface TemplateReferenceConfig {
  readonly name?: string;
  readonly paths: (TemplateReferencePathConfig | TemplateReferencePathConfig[])[];
}

export interface TextUIDefinitionConfigObject extends UIDefinitionConfigObject {
  emptyToNull: boolean;
  multiline?: boolean;
  options?: Array<string>;
  references?: { [key: string]: TemplateReferenceConfig };
}

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

  public constructor(config: TextUIDefinitionConfigObject) {
    super(config.label, config.key);
    this.multiline = !!config.multiline;
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

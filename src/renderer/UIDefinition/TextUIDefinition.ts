import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/Path/DataPathElement';
import DataPath from '../DataModel/Path/DataPath';
import { TemplateLine } from '../Model/TemplateEngine';

interface TemplateReferenceConfig {
  readonly name?: string;
  readonly paths: {
    path: string;
    keyPath: string;
    description?: string;
  }[];
}

export interface TemplateReference {
  readonly key: string;
  readonly name?: string;
  readonly paths: TemplateReferencePath[];
}

export interface TemplateReferencePath {
  path: DataPath;
  keyPath: DataPath;
  description?: TemplateLine;
}

export interface TextUIDefinitionConfigObject extends UIDefinitionConfigObject {
  emptyToNull: boolean;
  options?: Array<string>;
  references?: { [key: string]: TemplateReferenceConfig };
}

export default class TextUIDefinition extends UIDefinitionBase {
  public options?: Array<string>;
  public readonly references?: ReadonlyArray<TemplateReference>;

  public constructor(config: TextUIDefinitionConfigObject) {
    super(config.label, DataPathElement.parse(config.key));
    this.options = config.options;
    this.references = config.references && Object.keys(config.references).map(key => {
      const reference = config.references![key];
      return {
        key,
        name: reference.name,
        paths: reference.paths.map(path => ({
          path: DataPath.parse(path.path),
          keyPath: DataPath.parse(path.keyPath),
          description: path.description === undefined ? undefined : new TemplateLine(path.description)
        }))
      };
    });
  }
}

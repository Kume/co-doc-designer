import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import UIDefinitionConfig from './UIDefinitionConfig';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';

export interface FormUIDefinitionConfig extends UIDefinitionConfig {
}

export default class FormUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;
  private _keyOrder?: string[];

  public constructor(config: FormUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);
    this.keyFlatten = !!config.keyFlatten;
    if (dataSchema) {
      if (dataSchema.type === 'fixed_map') {
        for (const child of config.contents || []) {
          const childSchema = child.keyFlatten ? dataSchema : dataSchema.items.get(child.key!);
          this.addContent(UIDefinitionFactory.create(child, childSchema));
        }
      } else {
        throw new ConfigError('invalid type of data schema for FormUIDefinition');
      }
    } else {
      for (const child of config.contents || []) {
        this.addContent(UIDefinitionFactory.create(child));
      }
    }
  }

  public get key(): DataPathElement | undefined {
    return this.keyFlatten ? this.contents.first()!.key : this._key;
  }

  public get keyOrder(): string[] {
    if (!this._keyOrder) {
      this._keyOrder = [];
      this.contents.forEach(content => {
        if (content.key!.canBeMapKey) {
          this._keyOrder!.push(content.key!.asMapKey);
        }
      });
    }
    return this._keyOrder;
  }
}

UIDefinitionFactory.register('form', FormUIDefinition);

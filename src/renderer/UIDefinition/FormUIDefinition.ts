import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import UIDefinitionConfig, { FormUIDefinitionConfig } from './UIDefinitionConfig';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export default class FormUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;
  private _keyOrder?: string[];

  public constructor(
    config: FormUIDefinitionConfig,
    namedConfig: NamedItemManager<UIDefinitionConfig>,
    dataSchema?: AnyDataSchema
  ) {
    super(config, namedConfig, dataSchema);
    this.keyFlatten = !!config.keyFlatten;
    if (dataSchema) {
      if (dataSchema.type === 'fixed_map') {
        for (const content of config.contents || []) {
          const [child, childNamedConfig] = namedConfig.resolve(content);
          const childSchema = child.keyFlatten ? dataSchema : dataSchema.items.get(child.key!);
          this.addContent(UIDefinitionFactory.create(child, childNamedConfig, childSchema));
        }
      } else {
        throw new ConfigError('invalid type of data schema for FormUIDefinition');
      }
    } else {
      for (const child of config.contents || []) {
        this.addContent(UIDefinitionFactory.create(...namedConfig.resolve(child)));
      }
    }
  }

  public get key(): DataPathElement | undefined {
    // TODO 複数のキーを返せるように基本機能を拡張するべき
    return this.keyFlatten ? this.contents.find(content => !!content?.key?.canBeMapKey)!.key : this._key;
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

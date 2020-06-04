import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfig, { TabUIDefinitionConfig } from './UIDefinitionConfig';
import MapDataModel from '../DataModel/MapDataModel';
import { StrictKeyedUIDefinition } from './UIDefinitionBase';
import { List } from 'immutable';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

export default class TabUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;
  public readonly contents: List<StrictKeyedUIDefinition>;
  private _keyOrder?: string[];

  public constructor(
    config: TabUIDefinitionConfig,
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
        throw new ConfigError('invalid type of data schema for TabUIDefinitionConfig');
      }
    } else {
      for (const child of config.contents || []) {
        this.addContent(UIDefinitionFactory.create(...namedConfig.resolve(child)));
      }
    }
  }

  public get key(): DataPathElement | undefined {
    return this.keyFlatten ? this.contents.first()!.key : this._key;
  }

  public get keyOrder(): string[] {
    if (!this._keyOrder) {
      const keyOrder: string[] = [];
      this.contents.forEach(content => {
        if (content.key.canBeMapKey) {
          keyOrder.push(content.key.asMapKey);
        }
      });
      this._keyOrder = keyOrder;
    }
    return this._keyOrder;
  }

  public get defaultData(): MapDataModel {
    return MapDataModel.empty;
  }
}

UIDefinitionFactory.register('tab', TabUIDefinition);
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfig from './UIDefinitionConfig';
import DataSchema from '../DataSchema/DataSchema';

export default abstract class UIDefinitionBase {
  public readonly keyFlatten: boolean = false;
  protected readonly _key?: DataPathElement;
  private readonly _label: string;

  public constructor(config: UIDefinitionConfig, dataSchema?: DataSchema) {
    this._label = config.label || (dataSchema && dataSchema.label) || '';
    this._key = config.key === undefined ? undefined : DataPathElement.parse(config.key);
  }

  public get label(): string {
    return this._label;
  }

  get key(): DataPathElement | undefined {
    return this._key;
  }

  get keyString(): string {
    if (this.key === undefined) {
      throw new Error();
    }
    return this.key.asMapKey;
  }
}

export interface StrictKeyedUIDefinition extends UIDefinitionBase {
  key: DataPathElement;
}

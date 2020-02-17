import { DataContext, nextDataContext } from '../DataModel/DataContext';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';
import DataPath from '../DataModel/Path/DataPath';

export type DataSchemaType =
  'list' |
  'map' |
  'fixed_map' |
  'string' |
  'number' |
  'boolean' |
  'conditional';

type RawValueType = string | number | boolean | null;

export type MatchConditionConfig<Path = string, Value = RawValueType>
  = { path: Path, readonly match: Value };
export type OrConditionConfig<Path = string, Value = RawValueType>
  = { readonly or: readonly ConditionConfig<Path, Value>[] };
export type AndConditionConfig<Path = string, Value = RawValueType>
  = { readonly and: readonly ConditionConfig<Path, Value>[] };

export type ConditionConfig<Path = string, Value = RawValueType> =
  MatchConditionConfig<Path, Value> |
  AndConditionConfig<Path, Value> |
  OrConditionConfig<Path, Value>;

export interface ConditionalSchemaItem<T, DataModel> {
  condition: ConditionConfig<DataPath, DataModel>;
  item: T;
}

export interface DataSchemaConfig {
  type: DataSchemaType;
  label?: string;
  dataLabel?: string;
  dataDescription?: string;
  contextKey?: string;
}

export default class DataSchema {
  public readonly type: DataSchemaType;
  public readonly label?: string;
  public readonly dataLabel?: string;
  public readonly dataDescription?: string;
  public readonly context: readonly DataContext[];

  constructor(
    config: DataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ) {
    this.type = config.type;
    this.label = config.label;
    this.dataLabel = config.dataLabel;
    this.dataDescription = config.dataDescription;
    this.context = this.isVirtualNode ? context : nextDataContext(context, config.contextKey);
  }

  protected get isVirtualNode(): boolean { return false; }
}

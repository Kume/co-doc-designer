import { DataContext, nextDataContext } from '../DataModel/DataContext';

export type DataSchemaType =
  'list' |
  'map' |
  'fixed_map' |
  'string' |
  'number' |
  'boolean';

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

  constructor(config: DataSchemaConfig, context: readonly DataContext[]) {
    this.type = config.type;
    this.label = config.label;
    this.dataLabel = config.dataLabel;
    this.dataDescription = config.dataDescription;
    this.context = nextDataContext(context, config.contextKey);
  }
}
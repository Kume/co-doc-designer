export type UIDefinitionType =
  'contentList' |
  'table' |
  'mappingTable' |
  'text' |
  'checkbox' |
  'select' |
  'form' |
  'tab' |
  'number';

export default interface UIDefinitionConfig {
  type: UIDefinitionType;
  label?: string;
  key?: string;
  keyFlatten?: boolean;
  contents?: Array<UIDefinitionConfig>;
  content?: UIDefinitionConfig;
}

export interface MappingTableUIDefinitionConfig extends UIDefinitionConfig {
  type: 'mappingTable';
  sourcePath: string;
}

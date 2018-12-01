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

export interface TemplateReferencePathConfig {
  path: string;
  keyPath: string;
  description?: string;
}

export interface TemplateReferenceConfig {
  readonly name?: string;
  readonly paths: (TemplateReferencePathConfig | TemplateReferencePathConfig[])[];
}

export interface TextUIDefinitionConfig extends UIDefinitionConfig {
  emptyToNull: boolean;
  multiline?: boolean;
  options?: Array<string>;
  references?: { [key: string]: TemplateReferenceConfig };
}

export interface TabUIDefinitionConfig extends UIDefinitionConfig {
  keyFlatten?: boolean;
}

export type CollectionDataModelTypeString = 'list' | 'map';

export interface TableUIDefinitionConfig extends UIDefinitionConfig {
  dataType?: CollectionDataModelTypeString;
}

export interface SelectStaticOptionConfig<T = number | string> {
  label: string;
  value: T;
}

export interface SelectDynamicOptionConfig {
  path: string;
  labelPath?: string;
  valuePath?: string;
}

export type SelectOptionConfig<T = number | string> =
  SelectDynamicOptionConfig | Array<string | SelectStaticOptionConfig<T> | SelectDynamicOptionConfig>;

export interface SelectUIDefinitionConfig extends UIDefinitionConfig {
  emptyToNull: boolean;
  options?: SelectOptionConfig;
  isMulti?: boolean;
}

export interface NumberUIDefinitionConfig extends UIDefinitionConfig {

}

export interface FormUIDefinitionConfig extends UIDefinitionConfig {
}

export interface ContentListUIDefinitionConfig extends UIDefinitionConfig {
  listIndexKey?: string;
  dataType?: CollectionDataModelTypeString;
}

export interface CheckBoxUIDefinitionConfig extends UIDefinitionConfig {

}

export type AnyUIDefinitionConfig =
  CheckBoxUIDefinitionConfig |
  ContentListUIDefinitionConfig |
  FormUIDefinitionConfig |
  NumberUIDefinitionConfig |
  SelectUIDefinitionConfig |
  TableUIDefinitionConfig |
  TabUIDefinitionConfig |
  TextUIDefinitionConfig;
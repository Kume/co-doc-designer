export default interface UIDefinitionConfigObject {
  type: string;
  label?: string;
  key?: string;
  contents?: Array<UIDefinitionConfigObject>;
  content?: UIDefinitionConfigObject;
}
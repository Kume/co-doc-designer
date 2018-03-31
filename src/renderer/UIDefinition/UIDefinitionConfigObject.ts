export default interface UIDefinitionConfigObject {
  type: string;
  title: string;
  key: string;
  contents?: Array<UIDefinitionConfigObject>;
  content?: UIDefinitionConfigObject;
}
export default interface UIModelConfigObject {
  type: string;
  title: string;
  key: string;
  contents?: Array<UIModelConfigObject>;
  content?: UIModelConfigObject;
}
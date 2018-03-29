import UIModelBase from './UIModelBase';
import UIModelConfigObject from './UIModelConfigObject';
import DataPathElement from '../DataModel/DataPathElement';

export interface TextUIModelConfigObject extends UIModelConfigObject {
  emptyToNull: boolean;
}

export default class TextUIModel extends UIModelBase {
  public constructor(config: TextUIModelConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}

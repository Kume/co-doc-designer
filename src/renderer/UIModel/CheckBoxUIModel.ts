import UIModelBase from './UIModelBase';
import UIModelConfigObject from './UIModelConfigObject';
import DataPathElement from '../DataModel/DataPathElement';

export interface CheckBoxUIModelConfigObject extends UIModelConfigObject {

}

export default class CheckBoxUIModel extends UIModelBase {
  public constructor(config: CheckBoxUIModelConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}
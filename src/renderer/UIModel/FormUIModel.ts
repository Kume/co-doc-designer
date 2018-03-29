import MultiContentsUIModel from './MultiContentsUIModel';
import UIModelConfigObject from './UIModelConfigObject';
import DataPathElement from '../DataModel/DataPathElement';

export interface FormUIModelConfigObject extends UIModelConfigObject {

}

export default class FormUIModel extends MultiContentsUIModel {
  public constructor(config: FormUIModelConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}

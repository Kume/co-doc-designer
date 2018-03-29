import MultiContentsUIModel from './MultiContentsUIModel';
import DataPathElement from '../DataModel/DataPathElement';
import UIModelConfigObject from './UIModelConfigObject';

export interface TabUIModelConfigObject extends UIModelConfigObject {

}

export default class TabUIModel extends MultiContentsUIModel {
  public constructor(config: TabUIModelConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}
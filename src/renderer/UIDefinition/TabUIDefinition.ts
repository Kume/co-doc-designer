import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';

export interface TabUIDefinitionConfigObject extends UIDefinitionConfigObject {

}

export default class TabUIDefinition extends MultiContentsUIDefinition {
  public constructor(config: TabUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}
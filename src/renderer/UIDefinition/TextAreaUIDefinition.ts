import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import UIDefinitionBase from './UIDefinitionBase';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { FormUIDefinitionConfigObject } from './FormUIDefinition';

export interface TextAreaUIDefinitionConfigObject extends UIDefinitionConfigObject {

}

export default class TextAreaUIDefinition extends UIDefinitionBase {
  public constructor(config: FormUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}

import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import UIModel2, { MultiContentUIModel, UIModel2Props } from './UIModel2';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import TextUIModel2 from './TextUIModel2';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import FormUIModel2 from './FormUIModel2';

export class UIModel2Factory {
  public static create(definition: UIDefinitionBase, props: UIModel2Props): UIModel2<any> {
    if (definition instanceof FormUIDefinition) {
      return new FormUIModel2(definition, props);
    }
    if (definition instanceof TextUIDefinition) {
      return new TextUIModel2(definition, props);
    }
    throw new Error('Invalid ui definition.');
  }
}

MultiContentUIModel.registerFactory(UIModel2Factory.create);

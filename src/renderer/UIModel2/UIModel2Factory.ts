import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import UIModel2, { ContentUIModel, UIModel2Props } from './UIModel2';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import TextUIModel2 from './TextUIModel2';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import FormUIModel2 from './FormUIModel2';
import TabUIModel2 from './TabUIModel2';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';

export class UIModel2Factory {
  public static create(definition: UIDefinitionBase, props: UIModel2Props, oldModel?: UIModel2<any>): UIModel2<any> {
    if (definition instanceof FormUIDefinition) {
      return new FormUIModel2(definition, props, oldModel instanceof FormUIModel2 ? oldModel : undefined);
    }
    if (definition instanceof TextUIDefinition) {
      return new TextUIModel2(definition, props);
    }
    if (definition instanceof TabUIDefinition) {
      return new TabUIModel2(definition, props);
    }
    throw new Error('Invalid ui definition.');
  }
}

ContentUIModel.registerFactory(UIModel2Factory.create);

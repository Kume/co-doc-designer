import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import UIModel, { ContentUIModel, UIModelProps } from './UIModel';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import TextUIModel from './TextUIModel';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import FormUIModel from './FormUIModel';
import TabUIModel from './TabUIModel';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import CheckBoxUIModel from './CheckBoxUIModel';
import SelectUIDefinition from '../UIDefinition/SelectUIDefinition';
import SelectUIModel from './SelectUIModel';
import ContentListUIDefinition from '../UIDefinition/ContentListUIDefinition';
import ContentListUIModel from './ContentListUIModel';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import TableUIModel from './TableUIModel';
import NumberUIDefinition from '../UIDefinition/NumberUIDefinition';
import NumberUIModel from './NumberUIModel';

export class UIModelFactory {
  public static create(definition: UIDefinitionBase, props: UIModelProps, oldModel?: UIModel<any>): UIModel<any> {
    if (definition instanceof FormUIDefinition) {
      return new FormUIModel(definition, props, oldModel instanceof FormUIModel ? oldModel : undefined);
    }
    if (definition instanceof TextUIDefinition) {
      return new TextUIModel(definition, props);
    }
    if (definition instanceof TabUIDefinition) {
      return new TabUIModel(definition, props);
    }
    if (definition instanceof CheckBoxUIDefinition) {
      return new CheckBoxUIModel(definition, props);
    }
    if (definition instanceof SelectUIDefinition) {
      return new SelectUIModel(definition, props);
    }
    if (definition instanceof ContentListUIDefinition) {
      return new ContentListUIModel(definition, props);
    }
    if (definition instanceof TableUIDefinition) {
      return new TableUIModel(definition, props);
    }
    if (definition instanceof NumberUIDefinition) {
      return new NumberUIModel(definition, props);
    }
    throw new Error('Invalid ui definition.');
  }
}

ContentUIModel.registerFactory(UIModelFactory.create);

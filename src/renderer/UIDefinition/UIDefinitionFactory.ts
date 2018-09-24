import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import ContentListUIDefinition, { ContentListUIDefinitionConfigObject } from './ContentListUIDefinition';
import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import TableUIDefinition, { TableUIDefinitionConfigObject } from './TableUIDefinition';
import TextUIDefinition, { TextUIDefinitionConfigObject } from './TextUIDefinition';
import CheckBoxUIDefinition, { CheckBoxUIDefinitionConfigObject } from './CheckBoxUIDefinition';
import FormUIDefinition from './FormUIDefinition';
import TabUIDefinition from './TabUIDefinition';
import SingleContentUIDefinition from './SingleContentUIDefinition';
import SelectUIDefinition, { SelectUIDefinitionConfigObject } from './SelectUIDefinition';
import NumberUIDefinition from './NumberUIDefinition';

export class UIDefinitionFactory {
  public static create(config: UIDefinitionConfigObject): UIDefinitionBase {
    let model: UIDefinitionBase;
    switch (config.type) {
      case 'contentList':
        model = new ContentListUIDefinition(config as ContentListUIDefinitionConfigObject);
        break;

      case 'table':
        model = new TableUIDefinition(config as TableUIDefinitionConfigObject);
        break;

      case 'text':
        model = new TextUIDefinition(config as TextUIDefinitionConfigObject);
        break;

      case 'checkbox':
        model = new CheckBoxUIDefinition(config as CheckBoxUIDefinitionConfigObject);
        break;

      case 'select':
        model = new SelectUIDefinition(config as SelectUIDefinitionConfigObject);
        break;

      case 'form':
        model = new FormUIDefinition(config);
        break;

      case 'tab':
        model = new TabUIDefinition(config);
        break;

      case 'number':
        model = new NumberUIDefinition(config);
        break;

      default:
        throw new Error();
    }

    if (model instanceof MultiContentsUIDefinition) {
      for (const child of config.contents || []) {
        model.addContent(this.create(child));
      }
    } else if (model instanceof SingleContentUIDefinition) {
      model.content = this.create(config.content!);
    }

    return model;
  }
}
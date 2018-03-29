import UIModelBase from './UIModelBase';
import UIModelConfigObject from './UIModelConfigObject';
import ContentListUIModel from './ContentListUIModel';
import MultiContentsUIModel from './MultiContentsUIModel';
import TableUIModel, { TableUIModelConfigObject } from './TableUIModel';
import TextUIModel, { TextUIModelConfigObject } from './TextUIModel';
import CheckBoxUIModel, { CheckBoxUIModelConfigObject } from './CheckBoxUIModel';
import FormUIModel from './FormUIModel';
import TabUIModel from './TabUIModel';
import SingleContentUIModel from './SingleContentUIModel';

export class UIModelFactory {
  public static create(config: UIModelConfigObject): UIModelBase {
    let model: UIModelBase;
    switch (config.type) {
      case 'contentList':
        model = new ContentListUIModel(config);
        break;

      case 'table':
        model = new TableUIModel(config as TableUIModelConfigObject);
        break;

      case 'text':
        model = new TextUIModel(config as TextUIModelConfigObject);
        break;

      case 'checkbox':
        model = new CheckBoxUIModel(config as CheckBoxUIModelConfigObject);
        break;

      case 'form':
        model = new FormUIModel(config);
        break;

      case 'tab':
        model = new TabUIModel(config);
        break;

      default:
        throw new Error();
    }

    if (model instanceof MultiContentsUIModel) {
      for (const child of config.contents || []) {
        model.addContent(this.create(child));
      }
    } else if (model instanceof SingleContentUIModel) {
      model.content = this.create(config.content!);
    }

    return model;
  }
}
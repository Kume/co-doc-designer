import UIViewBase, { UIViewBaseProps } from './UIViewBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import TabUIView from './TabUIView';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';
import { ComponentClass } from 'react';
import ContentListUIDefinition from '../UIDefinition/ContentListUIDefinition';
import ContentListUIView from './ContentListUIView';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import TextUIView from './TextUIView';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import FormUIView from './FormUIView';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import TableUIView from './TableUIView';

export default class UIViewFactory {
  public static createUIView(model: UIDefinitionBase): ComponentClass<UIViewBaseProps> {
    if (model instanceof TabUIDefinition) {
      return TabUIView;
    }
    if (model instanceof ContentListUIDefinition) {
      return ContentListUIView;
    }
    if (model instanceof TextUIDefinition) {
      return TextUIView;
    }
    if (model instanceof FormUIDefinition) {
      return FormUIView;
    }
    if (model instanceof TableUIDefinition) {
      return TableUIView;
    }
    return UIViewBase;
  }
}
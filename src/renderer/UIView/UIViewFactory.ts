import UIViewBase, { UIViewBaseProps } from './UIViewBase';
import UIModelBase from '../UIModel/UIModelBase';
import TabUIView from './TabUIView';
import TabUIModel from '../UIModel/TabUIModel';
import { ComponentClass } from 'react';
import ContentListUIModel from '../UIModel/ContentListUIModel';
import ContentListUIView from './ContentListUIView';
import TextUIModel from '../UIModel/TextUIModel';
import TextUIView from './TextUIView';
import FormUIModel from '../UIModel/FormUIModel';
import FormUIView from './FormUIView';
import TableUIModel from '../UIModel/TableUIModel';
import TableUIView from './TableUIView';

export default class UIViewFactory {
  public createUIView(model: UIModelBase): ComponentClass<UIViewBaseProps> {
    if (model instanceof TabUIModel) {
      return TabUIView;
    }
    if (model instanceof ContentListUIModel) {
      return ContentListUIView;
    }
    if (model instanceof TextUIModel) {
      return TextUIView;
    }
    if (model instanceof FormUIModel) {
      return FormUIView;
    }
    if (model instanceof TableUIModel) {
      return TableUIView;
    }
    return UIViewBase;
  }
}
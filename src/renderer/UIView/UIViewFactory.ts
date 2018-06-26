import UIViewBase, { UIViewBaseProps } from './UIViewBase';
import TabUIView from './TabUIView';
import { ComponentClass } from 'react';
import TextUIView from './TextUIView';
import FormUIView from './FormUIView';
import UIModel2 from '../UIModel2/UIModel2';
import TextUIModel2 from '../UIModel2/TextUIModel2';
import TabUIModel2 from '../UIModel2/TabUIModel2';
import FormUIModel2 from '../UIModel2/FormUIModel2';
import CheckBoxUIView from './CheckBoxUIView';
import CheckBoxUIModel2 from '../UIModel2/CheckBoxUIModel2';
import SelectUIModel2 from '../UIModel2/SelectUIModel2';
import SelectUIView from './SelectUIView';
import ContentListUIModel2 from '../UIModel2/ContentListUIModel2';
import ContentListUIView from './ContentListUIView';

export default class UIViewFactory {
  public static createUIView(model: UIModel2): ComponentClass<UIViewBaseProps<UIModel2>> {
    if (model instanceof ContentListUIModel2) {
      return ContentListUIView;
    }
    if (model instanceof TextUIModel2) {
      return TextUIView;
    }
    // if (model instanceof TextAreaUIModel) {
    //   return TextAreaUIView;
    // }
    if (model instanceof TabUIModel2) {
      return TabUIView;
    }
    if (model instanceof FormUIModel2) {
      return FormUIView;
    }
    if (model instanceof CheckBoxUIModel2) {
      return CheckBoxUIView;
    }
    if (model instanceof SelectUIModel2) {
      return SelectUIView;
    }
    // if (model instanceof TableUIModel) {
    //   return TableUIView;
    // }
    return UIViewBase;
  }
}
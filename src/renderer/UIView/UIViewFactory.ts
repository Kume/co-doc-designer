import UIViewBase, { UIViewBaseProps } from './UIViewBase';
import TabUIView from './TabUIView';
import { ComponentClass } from 'react';
import TextUIView from './TextUIView';
import FormUIView from './FormUIView';
import UIModel from '../UIModel/UIModel';
import TextUIModel from '../UIModel/TextUIModel';
import TabUIModel from '../UIModel/TabUIModel';
import FormUIModel from '../UIModel/FormUIModel';
import CheckBoxUIView from './CheckBoxUIView';
import CheckBoxUIModel from '../UIModel/CheckBoxUIModel';
import SelectUIModel from '../UIModel/SelectUIModel';
import SelectUIView from './SelectUIView';
import ContentListUIModel from '../UIModel/ContentListUIModel';
import ContentListUIView from './ContentListUIView';
import TextAreaUIModel from '../UIModel/TextAreaUIModel';
import TextAreaUIView from './TextAreaUIView';
import TableUIModel from '../UIModel/TableUIModel';
import TableUIView from './TableUIView';

export default class UIViewFactory {
  public static createUIView(model: UIModel): ComponentClass<UIViewBaseProps<UIModel>> {
    if (model instanceof ContentListUIModel) {
      return ContentListUIView;
    }
    if (model instanceof TextUIModel) {
      return TextUIView;
    }
    if (model instanceof TextAreaUIModel) {
      return TextAreaUIView;
    }
    if (model instanceof TabUIModel) {
      return TabUIView;
    }
    if (model instanceof FormUIModel) {
      return FormUIView;
    }
    if (model instanceof CheckBoxUIModel) {
      return CheckBoxUIView;
    }
    if (model instanceof SelectUIModel) {
      return SelectUIView;
    }
    if (model instanceof TableUIModel) {
      return TableUIView;
    }
    return UIViewBase;
  }
}
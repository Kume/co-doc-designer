import UIViewBase, { UIViewBaseProps } from './UIViewBase';
import TabUIView from './TabUIView';
import { ComponentClass } from 'react';
import ContentListUIView from './ContentListUIView';
import TextUIView from './TextUIView';
import UIModel from "../UIModel/UIModel";
import TextUIModel from "../UIModel/TextUIModel";
import ContentListUIModel from "../UIModel/ContentListUIModel";
import TabUIModel from "../UIModel/TabUIModel";
import FormUIView from "./FormUIView";
import FormUIModel from "../UIModel/FormUIModel";
import CheckBoxUIModel from "../UIModel/CheckBoxUIModel";
import CheckBoxUIView from "./CheckBoxUIView";
import TableUIModel from "../UIModel/TableUIModel";
import TableUIView from "./TableUIView";

export default class UIViewFactory {
  public static createUIView(model: UIModel): ComponentClass<UIViewBaseProps> {
    if (model instanceof ContentListUIModel) {
      return ContentListUIView;
    }
    if (model instanceof TextUIModel) {
      return TextUIView;
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
    if (model instanceof TableUIModel) {
      return TableUIView;
    }
    return UIViewBase;
  }
}
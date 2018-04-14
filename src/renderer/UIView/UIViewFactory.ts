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
    return UIViewBase;
  }
}
import React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import { ConditionalUIModel } from '../UIModel/ConditionalUIModel';
import UIViewFactory from './UIViewFactory';

export default class ConditionalUIView
  extends UIViewBase<ConditionalUIModel, UIViewBaseProps<ConditionalUIModel>, UIViewBaseState> {
  public render(): React.ReactNode {
    const { model, applyAction, collectValue, focus } = this.props;
    const CurrentComponent = (model.child && UIViewFactory.createUIView(model.child));
    return CurrentComponent && (
      <CurrentComponent
        model={model.child!}
        applyAction={applyAction}
        collectValue={collectValue}
        focus={focus}
      />
    );
  }
}

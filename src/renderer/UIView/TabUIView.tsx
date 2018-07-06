import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIViewFactory from './UIViewFactory';
import { ReactNode } from 'react';
import TabUIModel from '../UIModel/TabUIModel';

export default class TabUIView extends UIViewBase<TabUIModel, UIViewBaseProps<TabUIModel>, UIViewBaseState> {
  public render(): ReactNode {
    const { model, applyAction, focus } = this.props;
    const CurrentComponent = UIViewFactory.createUIView(model.child);

    return (
      <div>
        <div className="ui-tab-head">
          {model.tabs.map(tab => {
            return (
              <div
                className={'ui-tab-tab' + (tab.isSelected ? ' selected' : '')}
                key={tab.key}
                onClick={() => focus(tab.path)}
              >
                {tab.label}
              </div>
            );
          })}
        </div>
        <div className="ui-tab-content">
          <CurrentComponent
            model={model.child}
            applyAction={applyAction}
            collectValue={this.props.collectValue}
            focus={focus}
          />
        </div>
      </div>
    );
  }
}

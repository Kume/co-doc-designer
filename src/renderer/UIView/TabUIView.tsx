import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIViewFactory from './UIViewFactory';
import { ReactNode } from 'react';
import TabUIModel from '../UIModel/TabUIModel';

interface Props extends UIViewBaseProps {
  model: TabUIModel;
}

export default class TabUIView extends UIViewBase<Props, UIViewBaseState> {
  public render(): ReactNode {
    const { model, dispatch } = this.props;
    const CurrentComponent = UIViewFactory.createUIView(model.childModel);

    return (
      <div>
        <div className="ui-tab-head">
          {model.tabs.map(tab => {
            return (
              <div
                className={'ui-tab-tab' + (tab.isSelected ? ' selected' : '')}
                key={tab.key}
                onClick={() => model.selectTab(dispatch, tab.key)}
              >
                {tab.title}
              </div>
            );
          })}
        </div>
        <div className="ui-tab-content">
          <CurrentComponent
            model={model.childModel}
            dispatch={dispatch}
            collectValue={this.props.collectValue}
          />
        </div>
      </div>
    );
  }
}

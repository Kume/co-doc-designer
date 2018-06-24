import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIViewFactory from './UIViewFactory';
import FormUIModel2 from '../UIModel2/FormUIModel2';

export default class FormUIView extends UIViewBase<FormUIModel2, UIViewBaseProps<FormUIModel2>, UIViewBaseState> {
  render() {
    return (
      <div>
        {Array.from(this.props.model.children.values()).map(childModel => {
          const ContentComponent = UIViewFactory.createUIView(childModel!);
          const definition = childModel!.definition;
          return (
            <div className="ui-form--row" key={definition.key.toString()}>
              <div className="ui-form--row-label">
                {definition.title}
              </div>
              <div className="ui-form--row-content">
                <ContentComponent
                  model={childModel!}
                  applyAction={this.props.applyAction}
                  collectValue={this.props.collectValue}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

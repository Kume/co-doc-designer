import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIViewFactory from './UIViewFactory';
import FormUIModel from '../UIModel/FormUIModel';

export default class FormUIView extends UIViewBase<FormUIModel, UIViewBaseProps<FormUIModel>, UIViewBaseState> {
  render() {
    console.log(this.props.model, this.props.model.children);
    return (
      <div>
        {Array.from(this.props.model.children.values()).map(childModel => {
          const ContentComponent = UIViewFactory.createUIView(childModel!);
          const definition = childModel!.definition;
          return (
            <div className="ui-form--row" key={definition.key.toString()}>
              <div className="ui-form--row-label">
                {definition.label}
              </div>
              <div className="ui-form--row-content">
                <ContentComponent
                  model={childModel!}
                  applyAction={this.props.applyAction}
                  collectValue={this.props.collectValue}
                  focus={this.props.focus}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

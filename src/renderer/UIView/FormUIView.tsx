import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import UIViewFactory from './UIViewFactory';
import MapDataModel from '../DataModel/MapDataModel';
import DataPath from '../DataModel/DataPath';
import DataModelBase from '../DataModel/DataModelBase';
import EditContext from '../UIModel/EditContext';
import DataModelFactory from "../DataModel/DataModelFactory";
import FormUIModel from "../UIModel/FormUIModel";

interface Props extends UIViewBaseProps {
  model: FormUIModel;
}

export default class FormUIView extends UIViewBase<Props, UIViewBaseState> {
  render() {
    return (
      <div>
        {this.props.model.children.map(childModel => {
          const ContentComponent = UIViewFactory.createUIView(childModel!);
          const definition = childModel!.definition;
          return (
            <div className="ui-form--row" key={definition.key.asMapKey}>
              <div className="ui-form--row-label">
                {definition.title}
              </div>
              <div className="ui-form--row-content">
                <ContentComponent
                  model={childModel!}
                  dispatch={this.props.dispatch}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

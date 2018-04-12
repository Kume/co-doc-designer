import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import UIViewFactory from './UIViewFactory';
import MapDataModel from '../DataModel/MapDataModel';
import DataPath from '../DataModel/DataPath';
import DataModelBase from '../DataModel/DataModelBase';
import EditContext from '../UIModel/EditContext';
import DataModelFactory from "../DataModel/DataModelFactory";

interface Props extends UIViewBaseProps {
  model: FormUIDefinition;
  data: MapDataModel;
}

export default class FormUIView extends UIViewBase<Props, UIViewBaseState> {
  render() {
    return (
      <div>
        {this.props.model.contents.map(contentModel => {
          const ContentComponent = UIViewFactory.createUIView(contentModel!);
          let data: DataModelBase | undefined;
          if (contentModel!.key.isKey) {
            data = this.props.indexInParent === undefined
              ? undefined : DataModelFactory.create(this.props.indexInParent);
          } else {
            data = this.props.data.valueForKey(contentModel!.key.asMapKey);
          }
          return (
            <div className="ui-form--row" key={contentModel!.key.toString()}>
              <div className="ui-form--row-label">
                {contentModel!.title}
              </div>
              <div className="ui-form--row-content">
                <ContentComponent
                  model={contentModel!}
                  data={data}
                  onUpdate={(path: DataPath, value: DataModelBase) => {
                    this.props.onUpdate(path.unshift(contentModel!.key), value);
                  }}
                  onSetEditContext={(context: EditContext) => {
                    this.props.onSetEditContext(context.unshift(contentModel!.key));
                  }}
                  editContext={this.props.editContext.shift()}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

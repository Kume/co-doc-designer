import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TabUIModel from '../UIModel/TabUIModel';
import UIViewFactory from './UIViewFactory';
import DataModelBase from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import { ReactNode } from 'react';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import UIModelBase from '../UIModel/UIModelBase';

interface Props extends UIViewBaseProps {
  model: TabUIModel;
}

export default class TabUIView extends UIViewBase<Props, UIViewBaseState> {
  public render(): ReactNode {
    const currentModel = this.props.model.contents.get(this.currentTabIndex);
    const CurrentComponent = UIViewFactory.createUIView(currentModel);

    return (
      <div>
        <div className="ui-tab-head">
          {this.props.model.contents.map((content, index) => {
            return (
              <div
                className={'ui-tab-tab' + (index === this.currentTabIndex ? ' selected' : '')}
                key={content!.key.asMapKey}
                onClick={() => this.props.onSetEditContext(new EditContext({path: new DataPath(content!.key)}))}
              >
                {content!.title}
              </div>
            );
          })}
        </div>
        <div className="ui-tab-content">
          <CurrentComponent
            model={currentModel}
            data={this._currentData()}
            onUpdate={(path: DataPath, value: DataModelBase) => {
              this.props.onUpdate(path.unshift(currentModel.key), value);
            }}
            onSetEditContext={(context: EditContext) => {
              this.props.onSetEditContext(context.unshift(currentModel.key));
            }}
            editContext={this.props.editContext.shift()}
            openModal={this.props.openModal}
            closeModal={this.props.closeModal}
          />
        </div>
      </div>
    );
  }

  private _currentData(): DataModelBase | undefined {
    if (this.props.data instanceof MapDataModel) {
      const key = this.props.model.contents.get(this.currentTabIndex).key;
      return this.props.data.valueForKey(key.asMapKey);
    }
    return undefined;
  }

  private get currentTabIndex(): number {
    const pathElement = this.props.editContext.path.elements.first();
    if (pathElement) {
      const index = this.props.model.contents.findIndex((model: UIModelBase) => {
        return model.key.asMapKey === pathElement.asMapKey;
      });
      if (index >= 0) {
        return index;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}

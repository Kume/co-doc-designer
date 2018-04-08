import * as React from 'react';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import UIViewFactory from './UIViewFactory';
import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import DataModelFactory from '../DataModel/DataModelFactory';
import EditContext from './EditContext';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import { sampleDataForUIConfig, sampleUIConfig } from '../UIDefinition/SampleData/SampleUIConfig';
import UIModel from "../UIModel/UIModel";
import { UIModelFactory } from "../UIModel/UIModelFactory";
import { UIModelManager } from "../UIModel/UIModelManager";
import { TextUIDefinitionConfigObject } from "../UIDefinition/TextUIDefinition";
import { ContentListUIDefinitionConfigObject } from "../UIDefinition/ContentListUIDefinition";

const simpleData = DataModelFactory.create(['first', 'second']);
const simpleUIDefinition = UIDefinitionFactory.create({
  type: 'contentList',
  key: '',
  title: '',
  listIndexKey: '$key',
  content: {
    type: 'text',
    title: '',
    key: '',
    emptyToNull: false
  },
  addFormContent: {
    type: 'text',
    title: '',
    key: '',
    emptyToNull: false
  },
  addFormDefaultValue: 'test'
} as ContentListUIDefinitionConfigObject);

interface Props {}
interface State {
  model: UIModel | undefined;
}

export default class RootUIView extends React.Component<Props, State> {
  private _manager: UIModelManager = new UIModelManager();

  constructor(props: Props, context?: any) {
    super(props, context);
    this._manager.initialize(simpleData, simpleUIDefinition);
    this._manager.notifyModelChanged = (model) => {
      console.log('notifyModelChanged');
      this.setState({model})
    };
    this.state = {
      model: this._manager.model
    };
  }

  get manager(): UIModelManager {
    return this._manager;
  }

  public render(): React.ReactNode {
    const model = this.state.model;
    if (model === undefined) {
      return <div />;
    } else {
      const CurrentComponent = UIViewFactory.createUIView(model);
      return (
        <div>
          <CurrentComponent
            model={model}
            dispatch={this._manager.dispatch}
          />
          {this.state.modalContent && (
            <div className="ui-root--modal-background" onClick={() => this.setState({modalContent: undefined})}>
              <div className="ui-root-modal-content" onClick={(e) => e.stopPropagation()}>
                {this.state.modalContent}
              </div>
            </div>
          )}
        </div>
      );
    }
  }
}
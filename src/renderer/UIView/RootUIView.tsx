import * as React from 'react';
import UIViewFactory from './UIViewFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import { sampleDataForUIConfig, sampleUIConfig } from '../UIDefinition/SampleData/SampleUIConfig';
import UIModelManager from '../UIModel/UIModelManager';
import UIModel from '../UIModel/UIModel';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataModelBase from '../DataModel/DataModelBase';
import { faFile, faSave } from '@fortawesome/free-regular-svg-icons';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import * as path from 'path';
import FileDataStorage from '../DataModel/Storage/FileDataStorage';
import * as Yaml from 'js-yaml';
import UIDefinitionConfigObject from '../UIDefinition/UIDefinitionConfigObject';
import DataMapper from '../DataModel/Storage/DataMapper';
import * as fs from 'fs';
import IconButton from '../View/IconButton';

import '@fortawesome/react-fontawesome';

interface Props {
}

interface State {
  model: UIModel | undefined;
  modalModel: UIModel | undefined;
  isFileLoaded: boolean;
  canBack: boolean;
  canForward: boolean;
}

export default class RootUIView extends React.Component<Props, State> {
  private _manager: UIModelManager;
  private dataMapper: DataMapper;

  constructor(props: Props, context?: any) {
    super(props, context);
    const definition = UIDefinitionFactory.create(sampleUIConfig);
    this._manager = new UIModelManager(definition, DataModelFactory.create(sampleDataForUIConfig));
    this._manager.notifyModelChanged = () => {
      this.setState({model: this._manager.rootUIModel});
    };
    this._manager.notifyModalModelChanged = () => {
      this.setState({modalModel: this._manager.modalUIModel});
    };
    this._manager.notifyHistoryChanged = () => {
      this.setState({canBack: this._manager.canBack, canForward: this._manager.canForward});
    };
    this.state = {
      model: this._manager.rootUIModel,
      modalModel: undefined,
      isFileLoaded: false,
      canBack: false,
      canForward: false
    };

    this._openFile = this._openFile.bind(this);
    this._saveFile = this._saveFile.bind(this);
    this.forward = this.forward.bind(this);
    this.back = this.back.bind(this);
  }

  public load(definition: UIDefinitionBase, data: DataModelBase): void {
    this._manager = new UIModelManager(definition, data);
    this._manager.notifyModelChanged = () => {
      this.setState({model: this._manager.rootUIModel});
    };
    this._manager.notifyModalModelChanged = () => {
      this.setState({modalModel: this._manager.modalUIModel});
    };
    this.setState({ model: this._manager.rootUIModel });
  }

  get manager(): UIModelManager {
    return this._manager;
  }

  _openFile() {
    const electron = require('electron');
    const dialog = electron.remote.dialog;
    dialog.showOpenDialog({}, (fileNames?: string[]) => {
      if (!fileNames) { return; }
      fs.readFile(fileNames[0], async (err, data) => {
        const schema = Yaml.safeLoad(data.toString()) as any;
        this.dataMapper = DataMapper.build(schema && schema.fileMap, new FileDataStorage(path.dirname(fileNames[0])));
        const loaded = await this.dataMapper.loadAsync();
        const model = UIDefinitionFactory.create(schema!.uiRoot as UIDefinitionConfigObject);
        this.load(model, loaded);
        this.setState({isFileLoaded: true});
      });
    });
  }

  async _saveFile() {
    if (this.state.model && this.state.model.props.data) {
      await this.dataMapper.saveAsync(this.state.model.props.data);
    }
  }

  public render(): React.ReactNode {
    const { model } = this.state;
    if (model === undefined) {
      return <div />;
    } else {
      const CurrentComponent = UIViewFactory.createUIView(model);
      // const ModalContentComponent = modalModel && UIViewFactory.createUIView(modalModel);
      return (
        <div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <IconButton icon={faFile} onClick={this._openFile} />
            <IconButton icon={faSave} onClick={this._saveFile} disabled={!this.state.isFileLoaded} />
            <IconButton icon={faArrowLeft} onClick={this.back} disabled={!this.state.canBack} />
            <IconButton icon={faArrowRight} onClick={this.forward} disabled={!this.state.canForward} />
          </div>
          <CurrentComponent
            model={model}
            applyAction={this._manager.applyActions}
            collectValue={this._manager.collectValue}
            focus={this._manager.focus}
          />
          {/*{ModalContentComponent && (*/}
            {/*<div className="ui-root--modal-background" onClick={() => this._manager.closeModal()}>*/}
              {/*<div className="ui-root-modal-content" onClick={(e) => e.stopPropagation()}>*/}
                {/*<ModalContentComponent*/}
                  {/*model={modalModel!}*/}
                  {/*dispatch={this._manager.dispatchForModal}*/}
                  {/*collectValue={this._manager.collectValue}*/}
                {/*/>*/}
                {/*<input*/}
                  {/*type="button"*/}
                  {/*onClick={() => this._manager.onModalSubmit(this._manager.modalData!)}*/}
                  {/*value="submit"*/}
                {/*/>*/}
              {/*</div>*/}
            {/*</div>*/}
          {/*)}*/}
        </div>
      );
    }
  }

  private back() {
    this.manager.back();
  }

  private forward() {
    this.manager.forward();
  }
}
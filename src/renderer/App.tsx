import * as React from 'react';
import './App.css';
import RootUIView from './UIView/RootUIView';
import * as fs from 'fs';
import * as Yaml from 'js-yaml';
import DataMapper from './DataModel/Storage/DataMapper';
import * as path from 'path';
import FileDataStorage from './DataModel/Storage/FileDataStorage';
import { UIDefinitionFactory } from './UIDefinition/UIDefinitionFactory';
import UIDefinitionConfigObject from './UIDefinition/UIDefinitionConfigObject';
import ObjectDataStorage from './DataModel/Storage/ObjectDataStorage';
import '@fortawesome/react-fontawesome';
import { faFile, faSave } from '@fortawesome/free-regular-svg-icons';
import IconButton from './View/IconButton';

interface Props {

}

interface State {
  isFileLoaded: boolean;
}

class App extends React.Component<Props, State> {
  private root: RootUIView | null = null;
  private dataMapper: DataMapper;

  constructor(props: Props) {
    super(props);
    this.state = {
      isFileLoaded: false
    };
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
        this.root!.load(model, loaded);
        this.setState({isFileLoaded: true});
      });
    });
  }

  async _saveFile() {
    const root = this.root;
    if (root && root.state.model && root.state.model.props.data) {
      await this.dataMapper.saveAsync(root.state.model.props.data);
    }
  }

  async _saveAsJson() {
    const root = this.root;
    if (root && root.state.model && root.state.model.props.data) {
      const electron = require('electron');
      const dialog = electron.remote.dialog;
      dialog.showSaveDialog({}, (fileName: string) => {
        fs.writeFile(fileName, JSON.stringify(root.state.model!.props.data!.toJsonObject()), () => {

        });
      });
    }
  }

  async _showYaml() {
    const root = this.root;
    if (root && root.state.model && root.state.model.props.data) {
      const storage = new ObjectDataStorage();
      const mapper = DataMapper.build({children: []}, storage);
      await mapper.saveAsync(root.state.model.props.data);
      const keys = Object.keys(storage.data);
      if (keys.length > 0) {
        alert(storage.data[keys[0]]);
      } else {
        alert('データがありません。');
      }
    } else {
      alert('データがありません。');
    }
  }

  render() {
    // const code: string = 'aaaa\nbbbccddc';

    return (
      <div className="App">
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <IconButton icon={faFile} onClick={() => this._openFile()} />
          <IconButton icon={faSave} onClick={() => this._saveFile()} disabled={!this.state.isFileLoaded} />
        </div>
        <RootUIView ref={ref => this.root = ref}/>
        <input type="button" value="Save As Json" onClick={() => this._saveAsJson()} />
        <input type="button" value="Show data as yaml" onClick={() => this._showYaml()} />
      </div>
    );
  }
}

export default App;

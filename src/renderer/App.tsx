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

class App extends React.Component {
  private root: RootUIView | null = null;
  private dataMapper: DataMapper;

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
        console.log('loaded', loaded.toJsonObject());
        this.root!.load(model, loaded);
      });
    });
  }

  async _saveFile() {
    const root = this.root;
    if (root && root.state.model && root.state.model.props.data) {
      await this.dataMapper.saveAsync(root.state.model.props.data);
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
        <RootUIView ref={ref => this.root = ref}/>
        <input type="button" value="Open" onClick={() => this._openFile()} />
        <input type="button" value="Save" onClick={() => this._saveFile()} />
        <input type="button" value="Show data as yaml" onClick={() => this._showYaml()} />
      </div>
    );
  }
}

export default App;

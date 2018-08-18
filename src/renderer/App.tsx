import * as React from 'react';
import './App.css';
import RootUIView from './UIView/RootUIView';
import * as fs from 'fs';
import DataMapper from './DataModel/Storage/DataMapper';
import ObjectDataStorage from './DataModel/Storage/ObjectDataStorage';

interface Props {
}

interface State {
}

class App extends React.Component<Props, State> {
  private root: RootUIView | null = null;

  constructor(props: Props) {
    super(props);
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
        <RootUIView ref={ref => this.root = ref}/>
        <input type="button" value="Save As Json" onClick={() => this._saveAsJson()} />
        <input type="button" value="Show data as yaml" onClick={() => this._showYaml()} />
      </div>
    );
  }
}

export default App;

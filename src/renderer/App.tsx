import * as React from 'react';
import './App.css';
import * as CodeMirror from 'react-codemirror';
import RootUIView from './UIView/RootUIView';
import * as fs from 'fs';
import * as Yaml from 'js-yaml';
import DataMapper from './DataModel/DataMapper';
import * as path from 'path';
import FileDataStorage from './DataModel/FileDataStorage';

const logo = require('./logo.svg');

class App extends React.Component {
  private editor: CodeMirror.EditorFromTextArea;
  private root: RootUIView | null = null;
  private dataMapper: DataMapper;

  _initCodemirror(component: any) {
    if (!component) { return; }
    this.editor = component.getCodeMirror();
    const label: HTMLSpanElement = document.createElement('span');
    label.innerText = 'dddd';
    label.className = 'label';

    this.editor.getDoc().markText({line: 0, ch: 2}, {line: 0, ch: 5}, {
      replacedWith: label
    });
  }

  _openFile() {
    const electron = require('electron');
    console.log(electron.remote);
    const dialog = electron.remote.dialog;
    dialog.showOpenDialog({}, (fileNames?: string[]) => {
      if (!fileNames) { return; }
      fs.readFile(fileNames[0], async (err, data) => {
        const schema = Yaml.safeLoad(data.toString());
        this.dataMapper = DataMapper.build(schema && schema['fileMap'], new FileDataStorage(path.dirname(fileNames[0])));
        const loaded = await this.dataMapper.loadAsync();
        console.log(loaded.toJsonObject());
      });
    });
  }

  async _saveFile() {
    const root = this.root;
    if (root && root.state.data) {
      await this.dataMapper.saveAsync(root.state.data);
    }
  }

  render() {
    const code: string = 'aaaa\nbbbccddc';

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <RootUIView ref={ref => this.root = ref}/>
        <input type="button" value="Open" onClick={() => this._openFile()} />
        <input type="button" value="Save" onClick={() => this._saveFile()} />
        <CodeMirror
          value={code}
          options={{lineNumbers: true}}
          ref={(ref: any) => this._initCodemirror(ref)}
        />
      </div>
    );
  }
}

export default App;

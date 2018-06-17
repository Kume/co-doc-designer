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

class App extends React.Component {
  // private editor: CodeMirror.EditorFromTextArea;
  private root: RootUIView | null = null;
  private dataMapper: DataMapper;

  // _initCodemirror(component: any) {
  //   if (!component) { return; }
  //   this.editor = component.getCodeMirror();
  //   const label: HTMLSpanElement = document.createElement('span');
  //   label.innerText = 'dddd';
  //   label.className = 'label';
  //
  //   this.editor.getDoc().markText({line: 0, ch: 2}, {line: 0, ch: 5}, {
  //     replacedWith: label
  //   });
  // }

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
      });
    });
  }

  async _saveFile() {
    const root = this.root;
    if (root && root.state.model && root.state.model.data) {
      await this.dataMapper.saveAsync(root.state.model.data);
    }
  }

  render() {
    // const code: string = 'aaaa\nbbbccddc';

    return (
      <div className="App">
        <RootUIView ref={ref => this.root = ref}/>
        <input type="button" value="Open" onClick={() => this._openFile()} />
        <input type="button" value="Save" onClick={() => this._saveFile()} />
        {/*<CodeMirror*/}
          {/*value={code}*/}
          {/*options={{lineNumbers: true}}*/}
          {/*ref={(ref: any) => this._initCodemirror(ref)}*/}
        {/*/>*/}
      </div>
    );
  }
}

export default App;

import UIDefinitionBase from './UIDefinitionBase';

export default class SingleContentUIDefinition extends UIDefinitionBase {
  private _content: UIDefinitionBase;

  get content(): UIDefinitionBase {
    return this._content;
  }
  set content(value: UIDefinitionBase) {
    this._content = value;
  }
}

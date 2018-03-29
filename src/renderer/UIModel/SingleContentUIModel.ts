import UIModelBase from './UIModelBase';

export default class SingleContentUIModel extends UIModelBase {
  private _content: UIModelBase;

  get content(): UIModelBase {
    return this._content;
  }
  set content(value: UIModelBase) {
    this._content = value;
  }
}

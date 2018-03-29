import UIModelBase from './UIModelBase';
import { List } from 'immutable';

export default class MultiContentsUIModel extends UIModelBase {
  private _contents: List<UIModelBase> = List<UIModelBase>();

  public get contents(): List<UIModelBase> {
    return this._contents;
  }

  public addContent(content: UIModelBase): void {
    this._contents = this._contents.push(content);
  }
}
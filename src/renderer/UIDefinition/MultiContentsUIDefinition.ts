import UIDefinitionBase from './UIDefinitionBase';
import { List } from 'immutable';

export default class MultiContentsUIDefinition extends UIDefinitionBase {
  private _contents: List<UIDefinitionBase> = List<UIDefinitionBase>();

  public get contents(): List<UIDefinitionBase> {
    return this._contents;
  }

  public addContent(content: UIDefinitionBase): void {
    this._contents = this._contents.push(content);
  }
}
import UIModel, { UIModelProps } from './UIModel';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import TextUIModel from './TextUIModel';
import ContentListUIDefinition from '../UIDefinition/ContentListUIDefinition';
import ContentListUIModel from './ContentListUIModel';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';
import TabUIModel from './TabUIModel';
import FormUIModel from './FormUIModel';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataPathElement from '../DataModel/DataPathElement';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import CheckBoxUIModel from './CheckBoxUIModel';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import TableUIModel from './TableUIModel';

type UIDefinitionClass = new (title: string, key: DataPathElement) => UIDefinitionBase;
type UIModelClass = new (props: UIModelProps) => UIModel;

export class UIModelFactory {
  private static _modelClasses: Array<[UIDefinitionClass, UIModelClass]> = [];

  public static create(props: UIModelProps): UIModel {
    if (props.definition instanceof TextUIDefinition) {
      return new TextUIModel(props);
    }
    if (props.definition instanceof ContentListUIDefinition) {
      return new ContentListUIModel(props);
    }
    if (props.definition instanceof TabUIDefinition) {
      return new TabUIModel(props);
    }
    if (props.definition instanceof FormUIDefinition) {
      return new FormUIModel(props);
    }
    if (props.definition instanceof CheckBoxUIDefinition) {
      return new CheckBoxUIModel(props);
    }
    if (props.definition instanceof TableUIDefinition) {
      return new TableUIModel(props);
    }
    throw new Error('Unknown UI Definition');
  }

  public static registerModel(definitionClass: UIDefinitionClass, modelClass: UIModelClass) {
    this._modelClasses.push([definitionClass, modelClass]);
  }
}

import UIModel, { UIModelProps } from './UIModel';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import TextUIModel from './TextUIModel';
import ContentListUIDefinition from '../UIDefinition/ContentListUIDefinition';
import ContentListUIModel from './ContentListUIModel';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';
import TabUIModel from './TabUIModel';
import FormUIModel from './FormUIModel';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import CheckBoxUIModel from './CheckBoxUIModel';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import TableUIModel from './TableUIModel';
import UIModelState from './UIModelState';
import TextAreaUIDefinition from '../UIDefinition/TextAreaUIDefinition';
import TextAreaUIModel from './TextAreaUIModel';
import SelectUIDefinition from '../UIDefinition/SelectUIDefinition';
import SelectUIModel from './SelectUIModel';

export class UIModelFactory {
  public static create(props: UIModelProps, lastState: UIModelState | undefined): UIModel {
    if (props.definition instanceof TextUIDefinition) {
      return new TextUIModel(props, lastState);
    }
    if (props.definition instanceof TextAreaUIDefinition) {
      return new TextAreaUIModel(props, lastState);
    }
    if (props.definition instanceof ContentListUIDefinition) {
      return new ContentListUIModel(props, lastState);
    }
    if (props.definition instanceof TabUIDefinition) {
      return new TabUIModel(props, lastState);
    }
    if (props.definition instanceof FormUIDefinition) {
      return new FormUIModel(props, lastState);
    }
    if (props.definition instanceof CheckBoxUIDefinition) {
      return new CheckBoxUIModel(props, lastState);
    }
    if (props.definition instanceof SelectUIDefinition) {
      return new SelectUIModel(props, lastState);
    }
    if (props.definition instanceof TableUIDefinition) {
      return new TableUIModel(props, lastState);
    }
    throw new Error('Unknown UI Definition');
  }
}

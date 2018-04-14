import UIModel, { UIModelProps } from "./UIModel";
import TextUIDefinition from "../UIDefinition/TextUIDefinition";
import TextUIModel from "./TextUIModel";
import ContentListUIDefinition from "../UIDefinition/ContentListUIDefinition";
import ContentListUIModel from "./ContentListUIModel";
import TabUIDefinition from "../UIDefinition/TabUIDefinition";
import TabUIModel from "./TabUIModel";
import FormUIModel from "./FormUIModel";
import FormUIDefinition from "../UIDefinition/FormUIDefinition";

export class UIModelFactory {
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
    throw new Error('Unknown UI Definition');
  }
}

import UIModel, { UIModelProps } from "./UIModel";
import TextUIDefinition from "../UIDefinition/TextUIDefinition";
import TextUIModel from "./TextUIModel";
import ContentListUIDefinition from "../UIDefinition/ContentListUIDefinition";
import ContentListUIModel from "./ContentListUIModel";

export class UIModelFactory {
  public static create(props: UIModelProps): UIModel {
    if (props.definition instanceof TextUIDefinition) {
      return new TextUIModel(props);
    }
    if (props.definition instanceof ContentListUIDefinition) {
      return new ContentListUIModel(props);
    }
    throw new Error('Unknown UI Definition');
  }
}
import { ColumnSetting, MultiSelectCellSetting, ReferenceCellSetting, TableChangeForRow } from './TableRowUIModel';
import { CollectValue } from './types';
import DataPath from '../DataModel/Path/DataPath';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import SelectUIDefinition from '../UIDefinition/SelectUIDefinition';
import NumberUIDefinition from '../UIDefinition/NumberUIDefinition';
import SelectUIModel from './SelectUIModel';
import UIModel from './UIModel';
import { UIModelAction } from './UIModelActions';
import TextUIModel from './TextUIModel';
import CheckBoxUIModel from './CheckBoxUIModel';
import NumberUIModel from './NumberUIModel';
import { List } from 'immutable';

export class TableUIModelCommon {
  public static cellSetting(
    model: UIModel | undefined,
    definition: UIDefinitionBase,
    dataPath: DataPath,
    collectValue: CollectValue,
    column: number
  ): ColumnSetting | ReferenceCellSetting | MultiSelectCellSetting {

    if (definition instanceof TextUIDefinition) {
      if (definition.options) {
        return {
          type: 'autocomplete',
          source: definition.options,
          strict: false
        };
      } else if (definition.references) {
        return {
          editor: 'reference',
          renderer: 'reference',
          dataPath: dataPath.push(column),
          references: definition.references
        };
      } else {
        return {
          type: 'text'
        };
      }
    } else if (definition instanceof CheckBoxUIDefinition) {
      return {
        type: 'checkbox'
      };
    } else if (definition instanceof SelectUIDefinition) {
      if (definition.isMulti) {
        const selectUIModel = model instanceof SelectUIModel ? model : undefined;
        return {
          editor: 'multi_select',
          renderer: 'multi_select',
          dataPath: dataPath.push(column),
          definition,
          value: selectUIModel && selectUIModel.value
        };
      } else {
        return {
          type: 'dropdown',
          source: SelectUIModel
            .options(collectValue, definition, dataPath.push(column))
            .map((option) => option.label)
        };
      }
    } else if (definition instanceof NumberUIDefinition) {
      return {
        type: 'numeric'
      };
    }

    return {};
  }

  public static input(
    changes: TableChangeForRow[],
    collectValue: CollectValue,
    dataPath: DataPath,
    definitions: List<UIDefinitionBase>
  ): UIModelAction[] {
    let actions: UIModelAction[] = [];
    for (const change of changes) {
      const childDefinition = definitions.get(change.column);
      if (childDefinition) {
        const childPath = dataPath.push(childDefinition.key!);
        if (childDefinition instanceof TextUIDefinition) {
          if (typeof change.value === 'string') {
            actions = actions.concat(TextUIModel.input(childDefinition, childPath, change.value));
          }
        } else if (childDefinition instanceof CheckBoxUIDefinition) {
          if (CheckBoxUIModel.canInputValue(change.value)) {
            actions = actions.concat(CheckBoxUIModel.input(childDefinition, childPath, change.value));
          }
        } else if (childDefinition instanceof NumberUIDefinition) {
          if (NumberUIModel.canInputValue(change.value)) {
            actions = actions.concat(NumberUIModel.input(childDefinition, childPath, change.value));
          }
        } else if (childDefinition instanceof SelectUIDefinition) {
          if (childDefinition.isMulti) {
            try {
              const value = JSON.parse(change.value);
              actions = actions.concat(SelectUIModel.input(childDefinition, childPath, value));
            } catch (error) {
              // JSONエラーになる入力は受け付けない
            }
          } else {
            actions = actions.concat(SelectUIModel.inputLabel(
              collectValue, undefined, childDefinition, childPath, change.value.toString()));
          }
        }
      }
    }
    return actions;
  }
}

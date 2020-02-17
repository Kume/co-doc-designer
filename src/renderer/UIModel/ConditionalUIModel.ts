import { SingleContentUIModel, UIModelProps } from './UIModel';
import { ConditionalUIDefinition } from '../UIDefinition/ConditionalUIDefinition';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { ConditionConfig } from '../DataSchema';
import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import { NullDataModel } from '../DataModel/ScalarDataModel';

function conditionIsMatch(
  condition: ConditionConfig<DataPath, DataModelBase>,
  value: DataModelBase | undefined
): boolean {
  if ('match' in condition) {
    const targetValue = value?.getValue(condition.path);
    return (targetValue === undefined && condition.match === NullDataModel.null) ||
      condition.match.equals(targetValue);
  }
  if ('or' in condition) {
    return condition.or.some(i => conditionIsMatch(i, value));
  }
  if ('and' in condition) {
    return condition.and.every(i => conditionIsMatch(i, value));
  }
  throw new Error('Invalid condition');
}

export class ConditionalUIModel extends SingleContentUIModel<ConditionalUIDefinition> {
  protected get childDefinition(): UIDefinitionBase | undefined {
    const { data } = this.props;
    if (!data) { return undefined; }
    for (const content of this.definition.contents) {
      if (conditionIsMatch(content.condition, data)) {
        return content.item;
      }
    }
    return undefined;
  }

  protected get childProps(): UIModelProps | undefined {
    return this.props;
  }
}
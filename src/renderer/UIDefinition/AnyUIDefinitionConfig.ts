import { CheckBoxUIDefinitionConfig } from './CheckBoxUIDefinition';
import { ContentListUIDefinitionConfig } from './ContentListUIDefinition';
import { FormUIDefinitionConfig } from './FormUIDefinition';
import { NumberUIDefinitionConfig } from './NumberUIDefinition';
import { SelectUIDefinitionConfig } from './SelectUIDefinition';
import { TableUIDefinitionConfig } from './TableUIDefinition';
import { TabUIDefinitionConfig } from './TabUIDefinition';
import { TextUIDefinitionConfig } from './TextUIDefinition';

export type AnyUIDefinitionConfig =
  CheckBoxUIDefinitionConfig |
  ContentListUIDefinitionConfig |
  FormUIDefinitionConfig |
  NumberUIDefinitionConfig |
  SelectUIDefinitionConfig |
  TableUIDefinitionConfig |
  TabUIDefinitionConfig |
  TextUIDefinitionConfig;
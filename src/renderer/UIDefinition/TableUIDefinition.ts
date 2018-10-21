import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import UIDefinitionConfig from './UIDefinitionConfig';
import CollectionDataModelUtil, {
  CollectionDataModelType,
  CollectionDataModelTypeString
} from '../DataModel/CollectionDataModelUtil';
import { CollectionDataModel } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';

export interface TableUIDefinitionConfig extends UIDefinitionConfig {
  dataType?: CollectionDataModelTypeString;
}

export default class TableUIDefinition extends MultiContentsUIDefinition {
  private _dataType: CollectionDataModelType = CollectionDataModelType.List;
  private _keyOrder?: string[];

  public constructor(config: TableUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);
    if (dataSchema) {
      if (dataSchema.type === 'map') {
        this._dataType = CollectionDataModelType.Map;
        const { item } = dataSchema;
        if (item.type === 'fixed_map') {
          for (const child of config.contents || []) {
            this.addContent(UIDefinitionFactory.create(child, item.items.get(child.key!)));
          }
        } else {
          throw new ConfigError('invalid type of data schema for TableUIDefinition children');
        }
      } else {
        throw new ConfigError('invalid type of data schema for TableUIDefinition');
      }
    } else {
      if (config.dataType) {
        this._dataType = CollectionDataModelUtil.parseModelType(config.dataType);
      }
      for (const child of config.contents || []) {
        this.addContent(UIDefinitionFactory.create(child));
      }
    }
  }

  public get dataType(): CollectionDataModelType {
    return this._dataType;
  }

  public get keyOrder(): string[] {
    if (!this._keyOrder) {
      this._keyOrder = [];
      this.contents.forEach(content => {
        if (content.key!.canBeMapKey) {
          this._keyOrder!.push(content.key!.asMapKey);
        }
      });
    }
    return this._keyOrder;
  }

  public get defaultData(): CollectionDataModel {
    if (this.dataType === CollectionDataModelType.Map) {
      return MapDataModel.empty;
    } else {
      return ListDataModel.empty;
    }
  }

  public get defaultRowData(): CollectionDataModel {
    return MapDataModel.empty;
  }
}

UIDefinitionFactory.register('table', TableUIDefinition);
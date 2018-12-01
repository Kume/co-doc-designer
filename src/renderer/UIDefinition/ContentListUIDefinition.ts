import SingleContentUIDefinition from './SingleContentUIDefinition';
import { ContentListUIDefinitionConfig } from './UIDefinitionConfig';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { CollectionDataModel } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';
import { CollectionDataModelType, default as CollectionDataModelUtil } from '../DataModel/CollectionDataModelUtil';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import { AnyDataSchema } from '../DataSchema';
import ConfigError from '../../common/Error/ConfigError';
import { TemplateLine } from '../Model/TemplateEngine';

export default class ContentListUIDefinition extends SingleContentUIDefinition {
  public readonly itemLabel?: TemplateLine;
  private readonly _listIndexKey?: DataPathElement;
  private readonly _dataType: CollectionDataModelType;

  public constructor(config: ContentListUIDefinitionConfig, dataSchema?: AnyDataSchema) {
    super(config, dataSchema);
    this._listIndexKey = config.listIndexKey === undefined ? undefined : DataPathElement.parse(config.listIndexKey);
    if (dataSchema) {
      if (dataSchema.type === 'map') {
        this._dataType = CollectionDataModelType.Map;
        this.itemLabel = dataSchema.item.dataLabel === undefined ?
          undefined : new TemplateLine(dataSchema.item.dataLabel);
        this.content = UIDefinitionFactory.create(config.content!, dataSchema.item);
      } else {
        throw new ConfigError('invalid type of data schema for ContentListUIDefinition');
      }
    } else {
      this._dataType = CollectionDataModelUtil.parseModelType(config.dataType);
      this.content = UIDefinitionFactory.create(config.content!);
    }
  }

  get listIndexKey(): DataPathElement | undefined {
    return this._listIndexKey;
  }

  get dataType(): CollectionDataModelType {
    return this._dataType;
  }

  get defaultData(): CollectionDataModel {
    if (this._dataType === CollectionDataModelType.List) {
      return new ListDataModel([]);
    } else {
      return new MapDataModel({});
    }
  }
}

UIDefinitionFactory.register('contentList', ContentListUIDefinition);
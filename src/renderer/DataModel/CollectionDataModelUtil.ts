export enum CollectionDataModelType {
  Map,
  List
}

export default class CollectionDataModelUtil {
  public static parseModelType(str: string): CollectionDataModelType {
    switch (str) {
      case 'list':
        return CollectionDataModelType.List;
      case 'map':
        return CollectionDataModelType.Map;
      default:
        throw new Error('Invalid collection data type');
    }
  }
}

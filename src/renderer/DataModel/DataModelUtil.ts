import DataModelBase from "./DataModelBase";

export default class DataModelUtil {
  public static equals(a: DataModelBase | undefined, b: DataModelBase | undefined): boolean {
    if (a === undefined) {
      return b === undefined;
    } else {
      return a.equals(b);
    }
  }
}
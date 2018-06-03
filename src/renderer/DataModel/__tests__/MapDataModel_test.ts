import MapDataModel from '../MapDataModel';
import { IntegerDataModel, NumberDataModel } from '../ScalarDataModel';
import ListDataModel from '../ListDataModel';
import DataPath from '../DataPath';
import DataPathElement from '../DataPathElement';
import DataModelFactory from '../DataModelFactory';

describe('Unit tests for MapDataModel', () => {
  describe('Unit tests for valueForKey', () => {
    it('Can get value', () => {
      const model = new MapDataModel({a: 2});
      expect(model.valueForKey('a')).toEqual(new IntegerDataModel(2));
    });

    it('Return undefined for non-existent key', () => {
      const model = new MapDataModel({a: 2});
      expect(model.valueForKey('b')).toBeUndefined();
    });

    it('Can construct with array', () => {
      const model = new MapDataModel({a: 2, b: ['b', 5]});
      expect(model.valueForKey('b')).toBeInstanceOf(ListDataModel);
    });
  });

  describe('Unit tests for getValue', () => {
    it('Can get value', () => {
      const model = new MapDataModel({a: 2});
      const path = new DataPath(['a']);
      expect(model.getValue(path)).toEqual(new IntegerDataModel(2));
    });

    it('Can get value deeply', () => {
      const model = new MapDataModel({a: 2, b: ['b', {c: 9}]});
      const path = new DataPath(['b', 1, 'c']);
      expect(model.getValue(path)).toEqual(new IntegerDataModel(9));
    });
  });

  describe('Unit tests for setValue', () => {
    it('Can set value for key', () => {
      const model = new MapDataModel({a: 2});
      const path = new DataPath('a');
      const updatedModel = model.setValue(path, new IntegerDataModel(5)) as MapDataModel;
      expect(updatedModel.valueForKey('a')).toEqual(new IntegerDataModel(5));
    });

    it('Can set value for key deeply', () => {
      const model = new MapDataModel({a: {b: {c: 9}}});
      const path = new DataPath(['a', 'b']);
      const updatedModel = model.setValue(path, new IntegerDataModel(5));
      expect(updatedModel).toEqual(new MapDataModel({a: {b: 5}}));
    });

    it('Can set value for key deeply with ListDataModel', () => {
      const model = new MapDataModel({a: [{b: 2}]});
      const path = new DataPath(['a', 0, 'b']);
      const updatedModel = model.setValue(path, new IntegerDataModel(5));
      expect(updatedModel).toEqual(new MapDataModel({a: [{b: 5}]}));
    });
  });

  describe('Unit tests for MapDataModel.collectValue', () => {
    it('Can collect single value', () => {
      const model = new MapDataModel({a: 1, b: 5});
      const path = DataPath.parse('b');
      const collected = model.collectValue(path);
      expect(collected.length).toBe(1);
      expect((<NumberDataModel> collected[0].data).value).toBe(5);
    });

    it('Can collect with single wild card', () => {
      const model = new MapDataModel({a: 1, b: 5});
      const path = DataPath.parse('*');
      const collected = model.collectValue(path);
      expect(collected.length).toBe(2);
      expect((<NumberDataModel> collected[0].data).value).toBe(1);
      expect((<NumberDataModel> collected[1].data).value).toBe(5);
    });

    it('Can collect with wild card at deep layer', () => {
      const model = new MapDataModel({a: {b: {c: 1, d: 5}}});
      const path = DataPath.parse('a.b.*');
      const collected = model.collectValue(path);
      expect(collected.length).toBe(2);
      expect((<NumberDataModel> collected[0].data).value).toBe(1);
      expect((<NumberDataModel> collected[1].data).value).toBe(5);
    });
  });

  describe('Unit tests for empty key element', () => {
    it('Can set empty key', () => {
      let model = new MapDataModel({a: 1});
      model = model.setValue(new DataPath(DataPathElement.last), DataModelFactory.create(3)) as MapDataModel;
      expect((<NumberDataModel> model.valueForListIndex(1)).value).toBe(3);
    });

    it('Empty key item is ignored on mapDataWithIndex', () => {
      let model = new MapDataModel({a: 1});
      model = model.setValue(new DataPath(DataPathElement.last), DataModelFactory.create(3)) as MapDataModel;
      const mapped = model.mapDataWithIndex(x => x);
      expect(mapped.length).toBe(1);
      expect((<NumberDataModel> mapped[0]).value).toBe(1);
    });

    it('Empty key item is appeared on mapAllData', () => {
      let model = new MapDataModel({a: 1});
      model = model.setValue(new DataPath(DataPathElement.last), DataModelFactory.create(3)) as MapDataModel;
      const mapped = model.mapAllData(x => x);
      expect(mapped.length).toBe(2);
      expect((<NumberDataModel> mapped[1]).value).toBe(3);
    });
  });
});
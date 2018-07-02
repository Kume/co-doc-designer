import MapDataModel from '../MapDataModel';
import { IntegerDataModel, NumberDataModel, StringDataModel } from '../ScalarDataModel';
import ListDataModel from '../ListDataModel';
import DataPath from '../Path/DataPath';
import DataPathElement from '../Path/DataPathElement';
import DataModelFactory from '../DataModelFactory';
import { InsertDataAction, MoveDataAction } from '../DataAction';

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
      expect(model.valueForListIndex(1)!.toJsonObject()).toBe(3);
    });

    it('Can create from private object', () => {
      const source = [{k: 'a', v: 1}, {v: 3}, {k: 'c', v: 7}, {k: 'c', v: 99}];
      let model = MapDataModel.create(source);
      expect(model.toJsonObject()).toEqual({a: 1, c: 7});
      expect(model.toPrivateJsonObject()).toEqual(source);
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

  describe('Unit tests for MapDataModel.applyInsertAction', () => {
    const insertActionBase = {type: 'Insert', data: new StringDataModel('***'), key: 'i'};
    (<{description: string, source: MapDataModel, action: InsertDataAction, expect: any}[]> [
      {
        description: 'Can insert by number index',
        source: new MapDataModel({a: 1, b: 3, c: 7}),
        action: {...insertActionBase, targetIndex: 1},
        expect: {a: 1, i: '***', b: 3, c: 7}
      },
      {
        description: 'Can insert by number index after',
        source: new MapDataModel({a: 1, b: 3, c: 7}),
        action: {...insertActionBase, targetIndex: 1},
        expect: {a: 1, b: 3, i: '***', c: 7}
      },
      {
        description: 'Can insert by string key',
        source: new MapDataModel({a: 1, b: 3, c: 7}),
        action: {...insertActionBase, targetIndex: 'b'},
        expect: {a: 1, i: '***', b: 3, c: 7}
      },
      {
        description: 'Can insert by string key after',
        source: new MapDataModel({a: 1, b: 3, c: 7}),
        action: {...insertActionBase, targetIndex: 'b', isAfter: true},
        expect: {a: 1, b: 3, i: '***', c: 7}
      },
      {
        description: 'Can insert by string key to last',
        source: new MapDataModel({a: 1, b: 3, c: 7}),
        action: {...insertActionBase, targetIndex: 'c', isAfter: true},
        expect: {a: 1, b: 3, c: 7, i: '***'}
      },
      {
        description: 'Can insert by string key to first',
        source: new MapDataModel({a: 1, b: 3, c: 7}),
        action: {...insertActionBase, targetIndex: 'a'},
        expect: {i: '***', a: 1, b: 3, c: 7}
      },
    ]).map(item => {
      it(item.description, () => {
        const inserted = item.source.applyInsertAction(item.action);
        expect(inserted.toJsonObject()).toEqual(item.expect);
      });
    });

    (<{description: string, source: MapDataModel, action: InsertDataAction, expect: any}[]> [
      {
        description: 'Can insert by number index with no key',
        source: new MapDataModel([{v: 1}, {v: 7}]),
        action: {...insertActionBase, key: undefined, targetIndex: 1},
        expect: [{v: 1}, {v: '***'}, {v: 7}]
      },
      {
        description: 'Can insert by number index with duplicated key',
        source: new MapDataModel([{k: 'a', v: 1}, {k: 'a', v: 7}]),
        action: {...insertActionBase, key: 'a', targetIndex: 1},
        expect: [{k: 'a', v: 1}, {k: 'a', v: '***'}, {k: 'a', v: 7}]
      },
    ]).map(item => {
      it(item.description, () => {
        const inserted = item.source.applyInsertAction(item.action);
        expect((<MapDataModel> inserted).toPrivateJsonObject()).toEqual(item.expect);
      });
    });
  });

  describe('Unit tests for MapDataModel.applyDeleteAction', () => {
    it('Can apply delete data action with number index', () => {
      const model = new MapDataModel({a: 1, b: 3, c: 7});
      const deleted = model.applyDeleteAction({type: 'Delete', targetIndex: 'b'});
      expect(deleted.toJsonObject()).toEqual({a: 1, c: 7});
    });

    it('Can apply delete data action with string key', () => {
      const model = new MapDataModel({a: 1, b: 3, c: 7});
      const deleted = model.applyDeleteAction({type: 'Delete', targetIndex: 1});
      expect(deleted.toJsonObject()).toEqual({a: 1, c: 7});
    });
  });

  describe('Unit tests for MapDataModel.applyMoveAction', () => {
    (<{description: string, source: MapDataModel, action: MoveDataAction, expect: any}[]> [
      {
        description: 'Can move with number index',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 2, to: 4},
        expect: [{k: 'a', v: 1}, {k: 'b', v: 3}, {k: 'd', v: 11}, {k: 'c', v: 7}, {k: 'e', v: 17}]
      },
      {
        description: 'Can move with number index and isAfter',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 1, to: 3, isAfter: true},
        expect: [{k: 'a', v: 1}, {k: 'c', v: 7}, {k: 'd', v: 11}, {k: 'b', v: 3}, {k: 'e', v: 17}]
      },
      {
        description: 'Can move to last with number index',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 2, to: 5},
        expect: [{k: 'a', v: 1}, {k: 'b', v: 3}, {k: 'd', v: 11}, {k: 'e', v: 17}, {k: 'c', v: 7}]
      },
      {
        description: 'Can move to last with number index and isAfter',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 2, to: 4, isAfter: true},
        expect: [{k: 'a', v: 1}, {k: 'b', v: 3}, {k: 'd', v: 11}, {k: 'e', v: 17}, {k: 'c', v: 7}]
      },
      {
        description: 'Can move to first with number index',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 2, to: 0},
        expect: [{k: 'c', v: 7}, {k: 'a', v: 1}, {k: 'b', v: 3}, {k: 'd', v: 11}, {k: 'e', v: 17}]
      },
      {
        description: 'Can move with string key',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 'c', to: 'e'},
        expect: [{k: 'a', v: 1}, {k: 'b', v: 3}, {k: 'd', v: 11}, {k: 'c', v: 7}, {k: 'e', v: 17}]
      },
      {
        description: 'Can move with string key and isAfter',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 'b', to: 'd', isAfter: true},
        expect: [{k: 'a', v: 1}, {k: 'c', v: 7}, {k: 'd', v: 11}, {k: 'b', v: 3}, {k: 'e', v: 17}]
      },
      {
        description: 'Can move to last string key index and isAfter',
        source: new MapDataModel({a: 1, b: 3, c: 7, d: 11, e: 17}),
        action: { type: 'Move', from: 'c', to: 'e', isAfter: true},
        expect: [{k: 'a', v: 1}, {k: 'b', v: 3}, {k: 'd', v: 11}, {k: 'e', v: 17}, {k: 'c', v: 7}]
      },
    ]).map(item => {
      it(item.description, () => {
        const moved = item.source.applyMoveAction(item.action);
        expect(moved.toPrivateJsonObject()).toEqual(item.expect);
      });
    });
  });
});
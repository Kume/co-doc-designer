import { UIModelProps } from '../UIModel';
import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';
import { default as TabUIDefinition, TabUIDefinitionConfigObject } from '../../UIDefinition/TabUIDefinition';
import TabUIModel, { TabUIModelState } from '../TabUIModel';
import DataPath from '../../DataModel/Path/DataPath';

require('../UIModelFactory');

const basicDefinitionConfig: TabUIDefinitionConfigObject = {
  type: 'tab',
  key: '',
  title: 'test',
  contents: [
    { type: 'text', key: 'a', title: 'A' },
    { type: 'text', key: 'b', title: 'B' },
    { type: 'text', key: 'c', title: 'C' },
  ]
};
const basicDefinition = UIDefinitionFactory.create(basicDefinitionConfig) as TabUIDefinition;

describe('Unit tests for TabUIModel', () => {
  describe('Unit tests for TabUIModel.selectedTab', () => {
    it('Select the first tab if there are no state and focus.', () => {
      const model = new TabUIModel(basicDefinition, UIModelProps.createSimple({}));
      expect(model.selectedTab).toBe('a');
    });

    it('Select tab according to the state', () => {
      const state = new TabUIModelState({selectedTab: 'b'});
      const model = new TabUIModel(basicDefinition, UIModelProps.createSimple({ state }));
      expect(model.selectedTab).toBe('b');
    });

    it('Select tab according to the focus', () => {
      const focusedPath = new DataPath(['b']);
      const model = new TabUIModel(basicDefinition, UIModelProps.createSimple({ focusedPath }));
      expect(model.selectedTab).toBe('b');
    });

    it('Focus has priority over state for selectedTab', () => {
      const state = new TabUIModelState({selectedTab: 'b'});
      const focusedPath = new DataPath(['c']);
      const model = new TabUIModel(basicDefinition, UIModelProps.createSimple({ state, focusedPath }));
      expect(model.selectedTab).toBe('c');
    });
  });

  describe('Unit tests for TabUIModel.adjustState', () => {
    it('Return an action if the state is not equal the focus', () => {
      const state = new TabUIModelState({selectedTab: 'b'});
      const focusedPath = new DataPath(['c']);
      const model = new TabUIModel(basicDefinition, UIModelProps.createSimple({ state, focusedPath }));
      const actions = model.adjustState();
      expect(actions.length).toBe(1);
      expect(actions[0].state).toEqual(new TabUIModelState({ selectedTab: 'c' }));
    });

    it('Return an action if the state is undefined and focus is not equal to default tab', () => {
      const focusedPath = new DataPath(['b']);
      const model = new TabUIModel(basicDefinition, UIModelProps.createSimple({ focusedPath }));
      const actions = model.adjustState();
      expect(actions.length).toBe(1);
      expect(actions[0].state).toEqual(new TabUIModelState({ selectedTab: 'b' }));
    });

    [
      { if: 'the state and focusedPath are undefined', state: undefined, focusedPath: undefined },
      { if: 'the state is equal the focus',
        state: new TabUIModelState({selectedTab: 'b'}), focusedPath: new DataPath(['b']) },
      { if: 'the focus is equal to the default tab', state: undefined, focusedPath: new DataPath(['a']) },
      { if: 'the focus is undefined', state: new TabUIModelState({selectedTab: 'b'}), focusedPath: undefined },
    ].map(testCase => {
      it(`Return no action if ${testCase.if}`, () => {
        const model = new TabUIModel(basicDefinition, UIModelProps.createSimple(testCase));
        const actions = model.adjustState();
        expect(actions.length).toBe(0);
      });
    });
  });
});
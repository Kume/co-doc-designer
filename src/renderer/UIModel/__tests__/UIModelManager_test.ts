import UIModelManager from '../UIModelManager';
import { List, Map } from 'immutable';
import { UIModelUpdateStateAction } from '../UIModelActions';
import { UIModelState } from '../types';
import { stateKey } from '../UIModel';
import { default as TabUIDefinition, TabUIDefinitionConfigObject } from '../../UIDefinition/TabUIDefinition';
import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';

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

describe('Unit tests for UIModelManager', () => {
  describe('Unit tests for UIModelManager.applyAction', () => {
    it('Can update state', () => {
      const manager = new UIModelManager(basicDefinition);
      const state: UIModelState = Map();
      const action: UIModelUpdateStateAction = {type: 'UpdateState', path: List(['a', 'b']), state};
      manager.applyActions([action]);
      expect(manager.rootStateNode!.getIn(['a', 'b', stateKey])).toBe(state);
    });
  });
});
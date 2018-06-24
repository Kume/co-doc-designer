import UIModel2Manager from '../UIModel2Manager';
import { List, Map } from 'immutable';
import { UIModelUpdateStateAction } from '../UIModel2Actions';
import { UIModel2State } from '../types';
import { stateKey } from '../UIModel2';
import { default as TabUIDefinition, TabUIDefinitionConfigObject } from '../../UIDefinition/TabUIDefinition';
import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';

require('../UIModel2Factory');

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
      const manager = new UIModel2Manager(basicDefinition);
      const state: UIModel2State = Map();
      const action: UIModelUpdateStateAction = {type: 'UpdateState', path: List(['a', 'b']), state};
      manager.applyActions([action]);
      expect(manager.rootStateNode!.getIn(['a', 'b', stateKey])).toBe(state);
    });
  });
});
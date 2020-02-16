import UIModelManager from '../UIModelManager';
import { List, Map } from 'immutable';
import { UIModelUpdateStateAction } from '../UIModelActions';
import { UIModelState } from '../types';
import { stateKey } from '../UIModel';
import { default as TabUIDefinition} from '../../UIDefinition/TabUIDefinition';
import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';
import UIDefinitionConfig, { TabUIDefinitionConfig } from '../../UIDefinition/UIDefinitionConfig';
import { NamedItemManager } from '../../DataModel/Storage/NamedItemManager';

require('../UIModelFactory');

const basicDefinitionConfig: TabUIDefinitionConfig = {
  type: 'tab',
  key: '',
  label: 'test',
  contents: [
    { type: 'text', key: 'a', label: 'A' },
    { type: 'text', key: 'b', label: 'B' },
    { type: 'text', key: 'c', label: 'C' },
  ]
};
const basicDefinition = UIDefinitionFactory.create(
  basicDefinitionConfig, new NamedItemManager<UIDefinitionConfig>({})) as TabUIDefinition;

describe('Unit tests for UIModelManager', () => {
  describe('Unit tests for UIModelManager.applyAction', () => {
    it('Can update state', () => {
      const manager = new UIModelManager(basicDefinition);
      const state: UIModelState = Map() as any;
      const action: UIModelUpdateStateAction = {type: 'UpdateState', path: List(['a', 'b']), state};
      manager.applyActions([action]);
      expect(manager.rootStateNode!.getIn(['a', 'b', stateKey])).toBe(state);
    });
  });
});
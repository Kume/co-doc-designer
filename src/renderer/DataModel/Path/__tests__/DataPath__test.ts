import DataPath from '../DataPath';
import DataPathElement from '../DataPathElement';
import { is } from 'immutable';

describe('Unit tests for DataPath', () => {
  describe('Unit tests for DataPath.parse', () => {
    it('Single element', () => {
      const path = DataPath.parse('foo');
      expect(path.elements.size).toBe(1);
      expect(path.elements.first()!.asMapKey).toBe('foo');
    });

    it('Multi elements', () => {
      const path = DataPath.parse('foo/bar/7');
      expect(path.elements.size).toBe(3);
      expect(path.elements.get(0)!.asMapKey).toBe('foo');
      expect(path.elements.get(2)!.asListIndex).toBe(7);
    });

    it('Include wildcard', () => {
      const path = DataPath.parse('foo/*/bar');
      expect(path.elements.size).toBe(3);
      expect(path.elements.get(1)!.type).toBe(DataPathElement.Type.WildCard);
    });

    it('Invalid format', () => {
      expect(() => {
        DataPath.parse('..bar');
      }).toThrow();
    });

    it('Can parse single key path', () => {
      const path = DataPath.parse('$key');
      expect(path.elements.size).toBe(0);
      expect(path.pointsKey).toBe(true);
    });
  });

  describe('Unit tests for equals', () => {
    it('Equals same path', () => {
      const path1 = DataPath.empty.push('a');
      const path2 = DataPath.empty.push('a');
      expect(path1).toEqual(path2);
      expect(is(path1, path2)).toBe(true);
    });
  });
});
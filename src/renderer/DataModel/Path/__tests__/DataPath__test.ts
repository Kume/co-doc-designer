import DataPath from '../../DataPath';
import DataPathElement from '../../DataPathElement';

describe('Unit tests for DataPath', () => {
  describe('Unit tests for DataPath.parse', () => {
    it('Single element', () => {
      const path = DataPath.parse('foo');
      expect(path.elements.size).toBe(1);
      expect(path.elements.first().asMapKey).toBe('foo');
    });

    it('Multi elements', () => {
      const path = DataPath.parse('foo.bar.7');
      expect(path.elements.size).toBe(3);
      expect(path.elements.get(0).asMapKey).toBe('foo');
      expect(path.elements.get(2).asListIndex).toBe(7);
    });

    it('Include wildcard', () => {
      const path = DataPath.parse('foo.*.bar');
      expect(path.elements.size).toBe(3);
      expect(path.elements.get(1).type).toBe(DataPathElement.Type.WildCard);
    });

    it('Invalid format', () => {
      expect(() => {
        DataPath.parse('..bar');
      }).toThrow();
    });
  });
});
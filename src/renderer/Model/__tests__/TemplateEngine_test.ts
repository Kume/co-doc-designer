import { TemplateLine } from '../TemplateEngine';

describe('Unit tests for TemplateLine', () => {
  describe('Unit tests for TemplateLine.parse', () => {
    it('Can parse line only has one token.', () => {
      const tokens = TemplateLine.parse('{{ test }}');
      expect(tokens.length).toBe(1);
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].key).toBe('test');
    });

    it('Can parse line has multi tokens.', () => {
      const tokens = TemplateLine.parse('{{ test }}{{foo}}{{bar}}');
      expect(tokens.length).toBe(3);
      expect(tokens[1].start).toBe(10);
      expect(tokens[1].key).toBe('foo');
      expect(tokens[2].key).toBe('bar');
    });
  });
  describe('Unit tests for TemplateLine.getTemplateTokenOn', () => {
    it('Select template token.', () => {
      const line = new TemplateLine('aaa {{ bbb }} ccc');
      expect(line.getTemplateTokenOn(1)).toBeUndefined();
      expect(line.getTemplateTokenOn(14)).toBeUndefined();
      expect(line.getTemplateTokenOn(10)).not.toBeUndefined();
    });
  });
});
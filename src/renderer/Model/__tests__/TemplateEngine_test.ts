import { TemplateLine } from '../TemplateEngine';

describe('Unit tests for TemplateLine', () => {
  describe('Unit tests for TemplateLine.constructor', () => {
    it('Can parse line only has one token.', () => {
      const line = new TemplateLine('{{ test }}');
      expect(line.tokens.length).toBe(1);
      expect(line.tokens[0].start).toBe(0);
      expect(line.tokens[0].key).toBe('test');
    });

    it('Can parse line has multi tokens.', () => {
      const line = new TemplateLine('{{ test }}{{foo}}{{bar}}');
      expect(line.tokens.length).toBe(3);
      expect(line.tokens[1].start).toBe(10);
      expect(line.tokens[1].key).toBe('foo');
      expect(line.tokens[2].key).toBe('bar');
    });

    it('Can parse line with extra braces', () => {
      const line = new TemplateLine('{{ { {{ test }} } }}');
      expect(line.tokens.length).toBe(1);
      expect(line.tokens[0].start).toBe(5);
      expect(line.tokens[0].end).toBe(15);
      expect(line.tokens[0].key).toBe('test');
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
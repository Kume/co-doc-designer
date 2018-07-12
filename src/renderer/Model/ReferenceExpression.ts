import * as TemplateValueParser from './ReferenceExpressionParser';

interface Parsed {
  category?: {
    before: number;
    after: number;
    text: string;
  };
  keys?: {
    before: number;
    after: number;
    text: (string | null)[];
  };
}

export interface TemplateValueHint {
  category?: string;
  fixedKeys: string[];
  currentKey: string;
  type: 'category' | 'keys' | 'none';
}

export type ReferenceExpressionType = 'category' | 'keys' | 'none';

export default class ReferenceExpression {
  public readonly hasError: boolean = false;
  public readonly isEmpty: boolean = false;
  public readonly parsed: Parsed | undefined;

  constructor(keyText: string) {
    if (keyText.trim() === '') {
      this.isEmpty = true;
      return;
    }

    try {
      this.parsed = TemplateValueParser.parse(keyText);
    } catch (error) {
      this.hasError = true;
    }
  }

  get isSingleKey(): boolean {
    const parsed = this.parsed!;
    return !parsed.category && !!parsed.keys && parsed.keys.text.length === 1;
  }

  get hasCategory(): boolean {
    return !!this.parsed && !!this.parsed.category;
  }

  get category(): string | undefined {
    if (!!this.parsed && !!this.parsed.category) {
      return this.parsed.category.text;
    } else {
      return undefined;
    }
  }

  get keyText(): string {
    if (!this.parsed || !this.parsed.keys) {
      return '';
    } else {
      return this.parsed.keys.text.filter(key => key).join('.');
    }
  }

  get currentType(): ReferenceExpressionType {
    if (!this.parsed) { return 'category'; }
    if (this.isEmpty) { return 'category'; }
    if (this.category) { return 'keys'; }
    if (this.parsed.keys!.text.length > 1) {
      return 'none';
    } else {
      return 'category';
    }
  }

  get currentKey(): string {
    if (!this.parsed || this.isEmpty) { return ''; }
    if (this.parsed.keys) {
      return this.parsed.keys.text[this.parsed.keys.text.length - 1] || '';
    } else {
      return '';
    }
  }

  get fixedKeys(): string[] {
    if (!this.parsed) { return []; }
    const keys = this.parsed.keys;
    if (!keys) { return []; }
    return keys.text.slice(0, keys.text.length - 1) as string[];
  }
}

interface TemplateToken {
  headKey: string;
  key: string;
  start: number;
  end: number;
}

export class TemplateLine {
  private _line: string;
  private _tokens: TemplateToken[];

  private static parse(line: string): TemplateToken[] {
    let searchCursor = 0;
    const tokens: TemplateToken[] = [];
    while (true) {
      let start = line.indexOf('{{', searchCursor);
      if (start < 0) { return tokens; }

      let nextStart = line.indexOf('{{', start + 2);
      const nextEnd = line.indexOf('}}', start + 2);
      if (nextEnd < 0) { return tokens; }
      while (nextStart > 0 && nextStart < nextEnd) {
        start = nextStart;
        nextStart = line.indexOf('{{', start + 2);
      }
      tokens.push({
        start,
        end: nextEnd + 2,
        headKey: '',
        key: line.substr(start + 2, nextEnd - start - 2).trim()
      });
      searchCursor = nextEnd + 2;
    }
  }

  public constructor(line: string) {
    this._line = line;
    this._tokens = TemplateLine.parse(line);
  }

  get tokens(): TemplateToken[] {
    return this._tokens;
  }

  public getTemplateTokenOn(ch: number): TemplateToken | undefined {
    for (const token of this._tokens) {
      if (ch < token.start) {
        return undefined;
      }
      if (ch < token.end) {
        return token;
      }
    }
    return undefined;
  }
}

export default class TemplateEngine {
}
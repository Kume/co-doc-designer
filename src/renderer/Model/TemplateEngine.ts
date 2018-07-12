import DataPath from '../DataModel/Path/DataPath';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';

export interface TemplateToken {
  key: string;
  start: number;
  end: number;
  path?: DataPath;
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
      let path: DataPath | undefined;
      const key = line.substr(start + 2, nextEnd - start - 2);
      try {
        path = DataPath.parse(key);
      } catch (error) {
        // console.log(error);
      }
      tokens.push({ start, end: nextEnd + 2, key, path });
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

  public fill(data: DataModelBase | undefined, index: CollectionIndex | undefined): string {
    let startIndex = 0;
    let line = '';
    for (const token of this.tokens) {
      const beforeLength = token.start - startIndex;
      line += this._line.substr(startIndex, beforeLength);
      if (token.path) {
        if (token.path.isEmptyPath && token.path.pointsKey) {
          line += index;
        } else if (data) {
          const resolvedValue = data.getValue(token.path);
          if (resolvedValue) {
            line += resolvedValue.toString();
          } else {
            line += '{{error!}}';
          }
        } else {
          line += '{{error!}}';
        }
      } else {
        line += '{{invalid path}}';
      }
      startIndex += beforeLength + token.key.length + 4;
    }
    return line + this._line.substr(startIndex);
  }
}

export default class TemplateEngine {
}
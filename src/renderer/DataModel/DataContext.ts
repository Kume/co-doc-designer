export interface DataContext {
  readonly key: string;
  readonly depth: number;
}

export function nextDataContext(
  context: readonly DataContext[],
  currentKey: string | undefined
): readonly DataContext[] {
  if (currentKey !== undefined) {
    return [...context, {key: currentKey, depth: 0}];
  } else {
    if (context.length > 0) {
      const nextContext = [...context];
      const lastContext = context[context.length - 1];
      nextContext[context.length - 1] = {...lastContext, depth: lastContext.depth + 1};
      return nextContext;
    } else {
      return context;
    }
  }
}

export function depthForContextKey(key: string, context: readonly DataContext[]): number | undefined {
  for (let i = context.length - 1; i >= 0; i--) {
    if (context[i].key === key) {
      let { depth } = context[i];
      for (let j = i + 1; j < context.length; j++) {
        depth += context[j].depth;
      }
      return depth;
    }
  }
  return undefined;
}
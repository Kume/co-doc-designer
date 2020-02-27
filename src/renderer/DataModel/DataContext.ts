export interface DataContext {
  readonly key: string;
  readonly depth: number;
}

export function nextDataContext(
  context: readonly DataContext[],
  currentKey: string | undefined
): readonly DataContext[] {
  const nextContext = [...context];
  if (nextContext.length > 0) {
    const lastContext = context[context.length - 1];
    nextContext[context.length - 1] = {...lastContext, depth: lastContext.depth + 1};
  }
  if (currentKey !== undefined) {
    return [...nextContext, {key: currentKey, depth: 0}];
  } else {
    return nextContext;
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
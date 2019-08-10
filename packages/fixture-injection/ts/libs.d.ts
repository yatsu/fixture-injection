declare module 'es-arguments' {
  export default function getArguments(func: Function): string[]
}

declare module 'graph-data-structure' {
  export default class Graph {
    addNode(node: string): Graph
    addEdge(u: string, v: string, weight?: number): Graph
    topologicalSort(sourceNodes?: string[], includeSourceNodes?: string[]): string[]
    adjacent(node: string): string[]
    nodes(): string[]
  }
}

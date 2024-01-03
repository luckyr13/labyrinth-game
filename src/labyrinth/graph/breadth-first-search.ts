import { Graph } from './graph'
import { Vertex } from './vertex'

export class BreadthFirstSearch
{
	search_helper(graph: Graph, start: Vertex, goal: Vertex, path: Vertex[]): Vertex[] {
		const children: Vertex[] = graph.edges[start.label]

		while (children.length > 0) {
			const child: Vertex = <Vertex>children.shift()
			// If child already visited
			if (path.findIndex(v => v.label === child?.label) >= 0) {
				continue
			}
			path.push( child )

			if (child.label === goal.label) {
				break
			}

			children.push(...graph.edges[child.label])

		}


		return path
	}


	// Returns a path from start to goal
	search(graph: Graph, start: Vertex, goal: Vertex): Vertex[] {
		// If start === goal
		if (start.label === goal.label) {
			return [start]
		}
		return this.search_helper(graph, start, goal, [start])
	}

}
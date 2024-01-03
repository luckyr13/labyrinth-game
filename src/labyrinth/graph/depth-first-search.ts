import { Graph } from './graph'
import { Vertex } from './vertex'

export class DepthFirstSearch
{
	search_helper(graph: Graph, start: Vertex, goal: Vertex, path: Vertex[], shortestPath: Vertex[]): Vertex[] {
		
		path.push(start)

		if (start.label === goal.label) {
			return [...path]
		}

		const children: Vertex[] = [...graph.edges[start.label]]
		if (children && children.length) {
			for (const child of children) {
				// If child already visited
				if (path.findIndex(v => v.label === child.label) >= 0) {
					continue
				}
				
				if (path.length < shortestPath.length || 
					(shortestPath.length === 0 && path.length) ) {
					const tmpShortestPath: Vertex[] = [...this.search_helper(graph, child, goal, [...path], shortestPath)]

					if (tmpShortestPath && tmpShortestPath.length) {
						shortestPath = tmpShortestPath
					}
				}

			}
		}

		return shortestPath

	}


	// Returns a path from start to goal
	search(graph: Graph, start: Vertex, goal: Vertex, greedy?: boolean): Vertex[] {
		// If start === goal
		if (start.label === goal.label) {
			return [start]
		}
		if (greedy) {
			return this.greedy_search_helper(graph, start, goal, [])
		}
		return this.search_helper(graph, start, goal, [], [])
	}

	// Manhattan distance
	distance(a: Vertex, b: Vertex): number {
		let res = -1
		const [aRow, aCol] = a.label.split(',')
		const [bRow, bCol] = b.label.split(',')
		res = Math.abs(+bRow - +aRow) + Math.abs(+bCol - +aCol)

		return res
	}

	


	greedy_search_helper(graph: Graph, start: Vertex, goal: Vertex, path: Vertex[]): Vertex[] {
		const children: Vertex[] = graph.edges[start.label]

		while (children.length > 0) {
			children.sort((a: Vertex, b: Vertex) => {
				// IF a < b
				if (this.distance(a, goal) < this.distance(b, goal)) {
					return 1
				} // If a > b
				else if (this.distance(a, goal) > this.distance(b, goal)) {
					return -1
				}

				// a == b
				return 0
			})

			const child: Vertex = <Vertex>children.pop()
			// If child already visited
			if (path.findIndex(v => v.label === child?.label) >= 0) {
				continue
			}
			path.push( child )

			// If goal reached
			if (child.label === goal.label) {
				break
			}
			const tmp = [...graph.edges[child.label]]
			children.push(...tmp)
		}

		return path
	}


}
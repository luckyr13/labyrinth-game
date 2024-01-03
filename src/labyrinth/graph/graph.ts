import { Edge } from './edge'
import { Vertex } from './vertex'

/*
* Graph Theory model
* 	+ Undirected Graph
*     Set (V, E)
*     V = Node (Vertex)
*     E = Edge (link)
* Adjacency Matrix
*/
export class Graph
{
	private _edges: Record<string, Vertex[]>
	private _vertices: Vertex[]

	constructor() {
		this._edges = {}
		this._vertices = []
	}

	get edges(): Record<string, Vertex[]> {
		return this._edges
	}

	get vertices(): Vertex[] {
		return this._vertices
	}

	public addVertex(vertex: Vertex): void {
		if (this._vertices.findIndex(v => v.label === vertex.label) < 0) {
			this._vertices.push(vertex)
			this._edges[vertex.label] = []
		} else {
			console.warn('Vertex already in list', vertex, this._vertices)
		}
	}

	public addEdge(edge: Edge): void {
		// Source
		if (Object.prototype.hasOwnProperty.call(this._edges, edge.source.label)) {
			if (this._edges[edge.source.label].findIndex(v => v.label === edge.destination.label) < 0) {
				this._edges[edge.source.label].push(edge.destination)
			} else {
				// console.warn('s-d Destination Vertex already in edges', edge.source.label, edge, this._edges)
			}
		} else {
			console.warn('Invalid node source', edge.source, edge)
		}
		// Destination
		if (Object.prototype.hasOwnProperty.call(this._edges, edge.destination.label)) {
			if (this._edges[edge.destination.label].findIndex(v => v.label === edge.source.label) < 0) {
				this._edges[edge.destination.label].push(edge.source)
			} else {
				// console.warn('d-s Source Vertex already in edges', edge.destination.label, edge, this._edges)
			}
		} else {
			console.warn('Invalid node destination', edge.destination, edge)
		}

	}

}
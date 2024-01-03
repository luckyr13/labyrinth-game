import { Vertex } from './vertex'

// Graph edge (link)
export class Edge
{
	private _source: Vertex;
	private _destination: Vertex;

	constructor(src:Vertex, dest:Vertex) {
		this._source = src;
		this._destination = dest;
	}

	get source(): Vertex {
		return this._source
	}

	get destination(): Vertex {
		return this._destination
	}

}
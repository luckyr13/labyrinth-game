// Graph Node (Vertex)
export class Vertex
{
	private _label: string

	constructor(label:string) {
		this._label = label
	}

	get label(): string {
		return this._label
	}

	set label(label: string) {
		this._label = label
	}

}
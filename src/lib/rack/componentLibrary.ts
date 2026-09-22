export type LibraryComponent =
	| {
			id: string;
			kind: 'rack';
			name: string;
			detail: string;
			units: number;
	  }
	| {
			id: string;
			kind: 'device';
			category: 'server' | 'switch' | 'storage';
			name: string;
			detail: string;
			sizeU: number;
	  };

export interface LibrarySection {
	id: string;
	name: string;
	items: LibraryComponent[];
}

export const componentSections: LibrarySection[] = [
	{
		id: 'servers',
		name: 'Servers',
		items: [1, 2, 3, 4].map((sizeU) => ({
			id: `server-${sizeU}u`,
			kind: 'device' as const,
			category: 'server' as const,
			name: `${sizeU}U Server`,
			detail: `Compute · ${sizeU}U`,
			sizeU
		}))
	},
	{
		id: 'racks',
		name: 'Racks',
		items: [42, 15, 9].map((units) => ({
			id: `rack-${units}u`,
			kind: 'rack' as const,
			name: `${units}U Rack`,
			detail: `Cabinet · ${units}U`,
			units
		}))
	},
	{
		id: 'switches',
		name: 'Switches',
		items: [
			{
				id: 'network-switch-1u',
				kind: 'device',
				category: 'switch',
				name: 'Network Switch',
				detail: 'Network · 1U',
				sizeU: 1
			}
		]
	},
	{
		id: 'storage',
		name: 'Storage',
		items: [
			{
				id: 'storage-array-2u',
				kind: 'device',
				category: 'storage',
				name: 'Storage Array',
				detail: 'Storage · 2U',
				sizeU: 2
			}
		]
	}
];

export function parseLibraryComponent(value: string): LibraryComponent | undefined {
	try {
		const component = JSON.parse(value) as LibraryComponent;
		return component?.kind === 'rack' || component?.kind === 'device' ? component : undefined;
	} catch {
		return undefined;
	}
}

import type { DeviceDefinition } from '$lib/rack/rack-layout';

export const deviceDefinitions: DeviceDefinition[] = [
	{
		id: 'switch-1u',
		name: 'Access Switch',
		description: '48-port managed switch',
		heightU: 1,
		type: 'network'
	},
	{
		id: 'server-2u',
		name: 'Compute Server',
		description: 'Dual-socket application host',
		heightU: 2,
		type: 'compute'
	},
	{
		id: 'storage-4u',
		name: 'Storage Array',
		description: 'High-density disk shelf',
		heightU: 4,
		type: 'storage'
	},
	{
		id: 'patch-1u',
		name: 'Patch Panel',
		description: '24-port copper panel',
		heightU: 1,
		type: 'connectivity'
	}
];

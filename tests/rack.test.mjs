import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRackReferenceSvg } from '../src/lib/export/rackSvg.ts';
import {
	mmToPx,
	rackUnitsToPx,
	EIA_RAIL_HOLE_OFFSETS_MM,
	railHoleYs,
	mountingBoltYs,
	resizedRackTop,
	uToY,
	deviceY,
	yToStartU,
	deviceBounds
} from '../src/lib/rack/rackGeometry.ts';
import {
	canPlaceDevice,
	canResizeRack,
	highestOccupiedUnit,
	MAX_RACK_UNITS,
	moveDevice,
	moveRack
} from '../src/lib/rack/rackModel.ts';
import { rackCabinetBounds, rackCabinetsOverlap } from '../src/lib/rack/rackPlacement.ts';

test('rail holes follow the repeating EIA-310 vertical spacing', () => {
	assert.deepEqual(EIA_RAIL_HOLE_OFFSETS_MM, [6.35, 22.225, 38.1]);
	const centers = [...railHoleYs, rackUnitsToPx(1) + railHoleYs[0]];
	const gapsMm = centers.slice(1).map((center, index) => (center - centers[index]) / (600 / 482.6));
	for (const [index, expected] of [15.875, 15.875, 12.7].entries())
		assert.ok(Math.abs(gapsMm[index] - expected) < 1e-12);
	const boltYs = mountingBoltYs(1);
	for (const index of [0, 1])
		assert.ok(Math.abs(boltYs[index] - [railHoleYs[0], railHoleYs[2]][index]) < 1e-12);
});

test('original physical scale and bottom-up U coordinates', () => {
	assert.equal(mmToPx(482.6), 600);
	assert.equal(rackUnitsToPx(1), 44.45 * (600 / 482.6));
	for (const units of [9, 12, 24, 42]) {
		assert.equal(uToY(units, units), 0);
		assert.equal(uToY(1, units), rackUnitsToPx(units - 1));
		for (const size of [1, 2, 3, 4])
			for (let start = 1; start <= units - size + 1; start++) {
				assert.equal(yToStartU(deviceY(start, size, units), size, units), start);
				assert.ok(Math.abs(deviceBounds(start, size, units).height - rackUnitsToPx(size)) < 1e-9);
			}
	}
	assert.equal(deviceY(4, 2, 9), rackUnitsToPx(4));
});
test('snap and clamp multi-U devices', () => {
	assert.equal(yToStartU(-100, 2, 9), 8);
	assert.equal(yToStartU(10000, 2, 9), 1);
	assert.equal(yToStartU(deviceY(4, 2, 9) + rackUnitsToPx(0.49), 2, 9), 4);
	assert.equal(yToStartU(deviceY(4, 2, 9) + rackUnitsToPx(0.51), 2, 9), 3);
});
test('occupancy rejects overlap and overflow; moves remain immutable', () => {
	const device = { id: 'a', name: 'A', startU: 4, sizeU: 2 };
	const rack = {
		id: 'r',
		name: 'R',
		units: 9,
		installation: 'wall-mount',
		devices: [device, { id: 'b', name: 'B', startU: 1, sizeU: 1 }]
	};
	assert.equal(canPlaceDevice(rack, device, 1), false);
	assert.equal(canPlaceDevice(rack, device, 2), true);
	assert.equal(canPlaceDevice(rack, device, 4), true);
	for (const u of [0, 9, 1.5, NaN]) assert.equal(canPlaceDevice(rack, device, u), false);
	assert.equal(moveDevice(rack, 'a', 1), rack);
	const moved = moveDevice(rack, 'a', 2);
	assert.equal(moved.devices[0].startU, 2);
	assert.equal(rack.devices[0].startU, 4);
	assert.equal('y' in moved.devices[0], false);
});

test('rack positions move immutably and reject invalid coordinates', () => {
	const rack = {
		id: 'r',
		name: 'R',
		units: 9,
		installation: 'wall-mount',
		x: 10,
		y: 20,
		devices: []
	};
	const moved = moveRack(rack, 120, 80);
	assert.deepEqual({ x: moved.x, y: moved.y }, { x: 120, y: 80 });
	assert.deepEqual({ x: rack.x, y: rack.y }, { x: 10, y: 20 });
	assert.equal(moveRack(rack, Number.NaN, 80), rack);
});

test('rack height can shrink only when removed top units are free', () => {
	const rack = {
		id: 'r',
		name: 'Rack',
		units: 15,
		installation: 'wall-mount',
		devices: [
			{ id: 'a', name: 'Server', startU: 2, sizeU: 2 },
			{ id: 'b', name: 'Storage', startU: 7, sizeU: 3 }
		]
	};
	assert.equal(highestOccupiedUnit(rack), 9);
	assert.equal(canResizeRack(rack, 9), true);
	assert.equal(canResizeRack(rack, 8), false);
	assert.equal(canResizeRack(rack, 20), true);
	for (const invalid of [0, 1.5, MAX_RACK_UNITS + 1, Number.NaN])
		assert.equal(canResizeRack(rack, invalid), false);
});

test('rack resizing moves only the top and keeps the bottom fixed', () => {
	const top = 120;
	const currentUnits = 15;
	for (const nextUnits of [9, 12, 24, 42]) {
		const nextTop = resizedRackTop(top, currentUnits, nextUnits);
		assert.ok(
			Math.abs(nextTop + rackUnitsToPx(nextUnits) - (top + rackUnitsToPx(currentUnits))) < 1e-9
		);
		assert.ok(nextUnits > currentUnits ? nextTop < top : nextTop > top);
	}
});

test('rack cabinet bounds prevent overlap but allow adjacent placement', () => {
	const first = rackCabinetBounds(42, -120, 40);
	const overlapping = rackCabinetBounds(15, 100, 200);
	const adjacent = rackCabinetBounds(15, first.right + 200, 40);
	assert.equal(rackCabinetsOverlap(first, overlapping), true);
	assert.equal(rackCabinetsOverlap(first, adjacent), false);
	assert.ok(
		rackCabinetBounds(9, 0, 0, 'wall-mount').bottom <
			rackCabinetBounds(9, 0, 0, 'floor-stand').bottom
	);
});

test('SVG export includes installation labels, positions, and escaped names', () => {
	const svg = createRackReferenceSvg(
		[
			{
				id: 'r1',
				name: 'Main & Backup',
				units: 9,
				installation: 'wall-mount',
				devices: [
					{
						id: 'd1',
						name: 'Storage <Primary>',
						startU: 4,
						sizeU: 2,
						category: 'storage'
					},
					{ id: 'd2', name: 'Compute', startU: 1, sizeU: 2, category: 'server' },
					{ id: 'd3', name: 'Core Switch', startU: 7, sizeU: 1, category: 'switch' }
				]
			}
		],
		{ generatedOn: '2026-09-26' }
	);
	assert.match(svg, /^<\?xml version="1\.0"/);
	assert.match(svg, /Installation reference · Not to scale/);
	assert.match(svg, /Main &amp; Backup/);
	assert.match(svg, /Storage &lt;Primary&gt;/);
	assert.match(svg, /U4–U5 · 2U/);
	assert.match(svg, /Generated 2026-09-26/);
	assert.match(svg, /9U · Wall mount/);
	assert.match(svg, /class="device-panel storage-panel"/);
	assert.match(svg, /class="device-panel switch-panel"/);
	assert.match(svg, /class="device-control"/);
	assert.match(svg, /class="switch-port"/);
});

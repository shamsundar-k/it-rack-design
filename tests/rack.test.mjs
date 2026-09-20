import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	mmToPx,
	rackUnitsToPx,
	uToY,
	deviceY,
	yToStartU,
	deviceBounds
} from '../src/lib/rack/rackGeometry.ts';
import { canPlaceDevice, moveDevice } from '../src/lib/rack/rackModel.ts';

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

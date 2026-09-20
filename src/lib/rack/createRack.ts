import type KonvaNamespace from 'konva';
import {
	deviceBounds,
	deviceY,
	mmToPx,
	mountingBoltYs,
	railWidth,
	rackWidth,
	rackUnitsToPx,
	uToY,
	yToStartU
} from './rackGeometry';
import { canPlaceDevice, type RackModel } from './rackModel';
import { createServerArtwork } from './serverArtwork';

export function createRack(
	Konva: typeof KonvaNamespace,
	options: {
		rack: RackModel;
		x: number;
		y: number;
		railImage: HTMLImageElement;
		selectedId?: string;
		onSelect: (id: string) => void;
		onMove: (id: string, startU: number) => void;
		onStatus: (message: string) => void;
	}
) {
	const { rack, railImage, onSelect, onMove, onStatus } = options;
	const group = new Konva.Group({ x: options.x, y: options.y, id: rack.id });
	const height = rackUnitsToPx(rack.units);
	group.add(
		new Konva.Text({ y: -34, text: `${rack.name} · ${rack.units}U`, fontSize: 18, fill: '#cbd5e1' })
	);
	group.add(new Konva.Rect({ width: rackWidth, height, fill: '#111e30' }));
	// Tile the same 1U SVG instead of stretching holes when capacity changes.
	for (const x of [0, rackWidth - railWidth]) {
		const rail = new Konva.Group({ x, listening: false });
		for (let row = 0; row < rack.units; row++) {
			rail.add(
				new Konva.Image({
					image: railImage,
					y: rackUnitsToPx(row),
					width: railWidth,
					height: rackUnitsToPx(1)
				})
			);
		}
		group.add(rail);
	}
	const slots: KonvaNamespace.Rect[] = [];
	for (let u = rack.units; u >= 1; u--) {
		const slot = new Konva.Rect({
			...deviceBounds(u, 1, rack.units),
			fill: 'rgba(255,255,255,0.01)',
			stroke: '#27364a',
			strokeWidth: 1,
			rackU: u
		});
		slot.on('mouseenter', () => {
			slot.fill('#20364b');
		});
		slot.on('mouseleave', () => {
			slot.fill('rgba(255,255,255,0.01)');
		});
		slot.on('click tap', () => onStatus(`${rack.name}, U${u}`));
		group.add(
			slot,
			new Konva.Text({
				x: -42,
				y: uToY(u, rack.units) + rackUnitsToPx(1) / 2 - 6,
				width: 32,
				align: 'right',
				text: `${u}`,
				fontSize: 12,
				fill: '#94a3b8',
				listening: false
			})
		);
		slots.push(slot);
	}
	const devices = new Map<string, KonvaNamespace.Group>();
	for (const device of rack.devices) {
		const bounds = deviceBounds(device.startU, device.sizeU, rack.units);
		const node = new Konva.Group({ x: bounds.x, y: bounds.y, draggable: true, id: device.id });
		const art = createServerArtwork(Konva, device.sizeU, device.name);
		art.y(-4);
		// Keep the original artwork inside its exact U allocation.
		const clipped = new Konva.Group({
			clipX: 0,
			clipY: 0,
			clipWidth: bounds.width,
			clipHeight: bounds.height
		});
		clipped.add(art);
		const outline = new Konva.Rect({
			width: bounds.width,
			height: bounds.height,
			stroke: device.id === options.selectedId ? '#38bdf8' : 'transparent',
			strokeWidth: 3,
			fill: 'rgba(0,0,0,0)'
		});
		node.add(clipped);
		// Ears sit outside the chassis clip and travel with the device. Their bolts
		// share the rail hole centers, so every snapped U position aligns.
		for (const x of [-railWidth / 2, bounds.width + railWidth / 2]) {
			const left = x < 0;
			node.add(
				new Konva.Rect({
					x: left ? -railWidth + mmToPx(2) : bounds.width - mmToPx(2),
					y: mmToPx(1),
					width: railWidth,
					height: bounds.height - mmToPx(2),
					cornerRadius: mmToPx(2),
					fillLinearGradientStartPoint: { x: 0, y: 0 },
					fillLinearGradientEndPoint: { x: railWidth, y: 0 },
					fillLinearGradientColorStops: [0, '#26323f', 0.5, '#657887', 1, '#26323f'],
					stroke: '#94a5b3',
					strokeWidth: 1
				})
			);
			for (const y of mountingBoltYs(device.sizeU)) {
				node.add(
					new Konva.Circle({
						x,
						y,
						radius: mmToPx(4.5),
						fill: '#163044',
						stroke: '#052b40',
						strokeWidth: 1
					}),
					new Konva.Circle({
						x,
						y,
						radius: mmToPx(3),
						fill: '#c8d7e2',
						stroke: '#f1f5f9',
						strokeWidth: 1
					}),
					new Konva.Line({
						points: [x - mmToPx(1.7), y, x + mmToPx(1.7), y],
						stroke: '#334155',
						strokeWidth: mmToPx(1)
					}),
					new Konva.Line({
						points: [x, y - mmToPx(1.7), x, y + mmToPx(1.7)],
						stroke: '#334155',
						strokeWidth: mmToPx(1)
					})
				);
			}
		}
		node.add(outline);
		node.on('mouseenter', () => {
			outline.stroke('#38bdf8');
		});
		node.on('mouseleave', () => {
			if (!node.isDragging())
				outline.stroke(device.id === options.selectedId ? '#38bdf8' : 'transparent');
		});
		node.on('click tap', (event) => {
			event.cancelBubble = true;
			onSelect(device.id);
		});
		node.on('dragstart', (event) => {
			event.cancelBubble = true;
			node.moveToTop();
		});
		node.on('dragmove', (event) => {
			event.cancelBubble = true;
			node.x(bounds.x);
			node.y(Math.max(0, Math.min(height - bounds.height, node.y())));
			const startU = yToStartU(node.y(), device.sizeU, rack.units);
			const valid = canPlaceDevice(rack, device, startU);
			outline.stroke(valid ? '#38bdf8' : '#fb7185');
			onStatus(
				valid
					? `${device.name}: U${startU}–U${startU + device.sizeU - 1}`
					: 'Occupied units — release to restore the previous position.'
			);
		});
		node.on('dragend', (event) => {
			event.cancelBubble = true;
			const startU = yToStartU(node.y(), device.sizeU, rack.units);
			const valid = canPlaceDevice(rack, device, startU);
			node.position({
				x: bounds.x,
				y: deviceY(valid ? startU : device.startU, device.sizeU, rack.units)
			});
			if (valid) onMove(device.id, startU);
			else {
				outline.stroke(device.id === options.selectedId ? '#38bdf8' : 'transparent');
				onStatus('Move rejected: those units are occupied.');
			}
		});
		group.add(node);
		devices.set(device.id, node);
	}
	return { group, slots, devices };
}

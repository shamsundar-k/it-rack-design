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
import {
	createRackCabinet,
	rackCabinetSideWidth,
	RACK_BOTTOM_COVER_HEIGHT,
	RACK_TOP_COVER_HEIGHT
} from './rackCabinetArtwork';
import { createServerArtwork } from './serverArtwork';

export function createRack(
	Konva: typeof KonvaNamespace,
	options: {
		rack: RackModel;
		x: number;
		y: number;
		railImage: HTMLImageElement;
		serverFaceImages: ReadonlyMap<number, HTMLImageElement>;
		selectedId?: string;
		onSelect: (id: string) => void;
		onRackSelect: () => void;
		onContextMenu: (id: string, event: MouseEvent) => void;
		onMove: (id: string, startU: number) => void;
		onRackMove: (x: number, y: number) => void;
		canMoveRack: (x: number, y: number) => boolean;
		onStatus: (message: string) => void;
	}
) {
	const { rack, railImage, serverFaceImages, onSelect, onMove, onStatus } = options;
	const group = new Konva.Group({
		x: options.x,
		y: options.y,
		id: rack.id,
		draggable: false
	});
	const height = rackUnitsToPx(rack.units);
	const labelScale = Math.max(1, Math.min(2.5, rack.units / 12));
	const unitLabelFontSize = 12 * labelScale;
	const unitLabelWidth = 32 * labelScale;
	const cabinetSideWidth = rackCabinetSideWidth(rack.units);
	let lastValidPosition = { x: options.x, y: options.y };
	group.on('dragstart', (event) => {
		event.cancelBubble = true;
		group.moveToTop();
		onStatus(`Moving ${rack.name}.`);
	});
	group.on('dragmove', (event) => {
		event.cancelBubble = true;
		const next = group.position();
		if (options.canMoveRack(next.x, next.y)) {
			lastValidPosition = next;
			onStatus(`Moving ${rack.name}.`);
		} else {
			group.position(lastValidPosition);
			onStatus('Rack cannot overlap another rack.');
		}
	});
	group.on('dragend', (event) => {
		event.cancelBubble = true;
		options.onRackMove(group.x(), group.y());
		group.draggable(false);
		const container = group.getStage()?.container();
		if (container) container.style.cursor = '';
		onStatus(`${rack.name} moved.`);
	});
	group.add(
		new Konva.Text({
			x: -cabinetSideWidth,
			y: -54,
			width: rackWidth + cabinetSideWidth * 2,
			align: 'center',
			text: `${rack.name} · ${rack.units}U`,
			fontSize: 18,
			fill: '#344054'
		})
	);
	group.add(createRackCabinet(Konva, height, cabinetSideWidth, rack.installation));
	group.add(
		new Konva.Rect({
			x: -cabinetSideWidth,
			y: -RACK_TOP_COVER_HEIGHT,
			width: rackWidth + cabinetSideWidth * 2,
			height: height + RACK_TOP_COVER_HEIGHT + RACK_BOTTOM_COVER_HEIGHT,
			stroke: rack.id === options.selectedId ? '#2563eb' : 'transparent',
			strokeWidth: 3,
			listening: false
		})
	);
	const shellHandles = [
		new Konva.Rect({
			x: -cabinetSideWidth,
			y: -RACK_TOP_COVER_HEIGHT,
			width: cabinetSideWidth,
			height: height + RACK_TOP_COVER_HEIGHT + RACK_BOTTOM_COVER_HEIGHT
		}),
		new Konva.Rect({
			x: rackWidth,
			y: -RACK_TOP_COVER_HEIGHT,
			width: cabinetSideWidth,
			height: height + RACK_TOP_COVER_HEIGHT + RACK_BOTTOM_COVER_HEIGHT
		}),
		new Konva.Rect({
			x: 0,
			y: -RACK_TOP_COVER_HEIGHT,
			width: rackWidth,
			height: RACK_TOP_COVER_HEIGHT
		}),
		new Konva.Rect({
			x: 0,
			y: height,
			width: rackWidth,
			height: RACK_BOTTOM_COVER_HEIGHT
		})
	];
	for (const handle of shellHandles) {
		handle.fill('rgba(0,0,0,0.001)');
		handle.on('mouseenter', () => {
			const container = group.getStage()?.container();
			if (container) container.style.cursor = 'grab';
		});
		handle.on('mouseleave', () => {
			if (group.isDragging()) return;
			const container = group.getStage()?.container();
			if (container) container.style.cursor = '';
		});
		handle.on('mousedown touchstart', (event) => {
			event.cancelBubble = true;
			options.onRackSelect();
			group.draggable(true);
			group.startDrag(event);
			const container = group.getStage()?.container();
			if (container) container.style.cursor = 'grabbing';
		});
		handle.on('click tap', (event) => {
			event.cancelBubble = true;
			options.onRackSelect();
			onStatus(`${rack.name} selected.`);
		});
	}
	group.add(...shellHandles);
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
			fill: 'rgba(255,255,255,0.015)',
			stroke: '#294a6d',
			strokeWidth: 1,
			rackU: u
		});
		slot.on('mouseenter', () => {
			slot.fill('#1b4268');
		});
		slot.on('mouseleave', () => {
			slot.fill('rgba(255,255,255,0.015)');
		});
		slot.on('mousedown touchstart', (event) => {
			event.cancelBubble = true;
		});
		slot.on('click tap', () => onStatus(`${rack.name}, U${u}`));
		group.add(
			slot,
			new Konva.Text({
				x: -unitLabelWidth - 10,
				y: uToY(u, rack.units) + rackUnitsToPx(1) / 2 - unitLabelFontSize / 2,
				width: unitLabelWidth,
				align: 'right',
				text: `${u}`,
				fontSize: unitLabelFontSize,
				fontStyle: 'bold',
				fill: '#667085',
				listening: false
			})
		);
		slots.push(slot);
	}
	const unitDividers = new Konva.Group({ listening: false });
	for (let boundary = 1; boundary < rack.units; boundary++) {
		const y = rackUnitsToPx(boundary);
		unitDividers.add(
			new Konva.Line({
				points: [railWidth, y, rackWidth - railWidth, y],
				stroke: '#67a9c7',
				strokeWidth: 1.5,
				opacity: 0.9
			}),
			new Konva.Line({
				points: [railWidth - 5, y, railWidth + 9, y],
				stroke: '#22d3ee',
				strokeWidth: 2
			}),
			new Konva.Line({
				points: [rackWidth - railWidth - 9, y, rackWidth - railWidth + 5, y],
				stroke: '#22d3ee',
				strokeWidth: 2
			})
		);
	}
	group.add(unitDividers);
	const devices = new Map<string, KonvaNamespace.Group>();
	for (const device of rack.devices) {
		const bounds = deviceBounds(device.startU, device.sizeU, rack.units);
		const node = new Konva.Group({ x: bounds.x, y: bounds.y, draggable: true, id: device.id });
		const useLargeServerLabel = rack.units >= 24;
		const art = createServerArtwork(
			Konva,
			device.sizeU,
			serverFaceImages.get(device.sizeU)!,
			useLargeServerLabel ? undefined : device.name
		);
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
			stroke: device.id === options.selectedId ? '#2563eb' : 'transparent',
			strokeWidth: 3,
			fill: 'rgba(0,0,0,0)'
		});
		node.add(clipped);
		if (useLargeServerLabel) {
			const fontSize = Math.min(rackUnitsToPx(1) * 0.55, 12 * labelScale);
			const labelHeight = fontSize + 8;
			const labelY = Math.max(4, (bounds.height - labelHeight) / 2);
			node.add(
				new Konva.Rect({
					x: 120,
					y: labelY,
					width: bounds.width - 137,
					height: labelHeight,
					cornerRadius: 3,
					fill: '#ffffff',
					opacity: 0.92,
					stroke: '#06b6d4',
					strokeWidth: 1.5,
					listening: false
				}),
				new Konva.Text({
					x: 128,
					y: labelY + 4,
					width: bounds.width - 153,
					height: fontSize,
					text: device.name,
					fontFamily: 'Inter, sans-serif',
					fontSize,
					fontStyle: 'bold',
					align: 'center',
					verticalAlign: 'middle',
					wrap: 'none',
					ellipsis: true,
					fill: '#16324f',
					listening: false
				})
			);
		}
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
					fillLinearGradientColorStops: [0, '#8796a8', 0.5, '#eef2f6', 1, '#8796a8'],
					stroke: '#64748b',
					strokeWidth: 1
				})
			);
			for (const y of mountingBoltYs(device.sizeU)) {
				node.add(
					new Konva.Circle({
						x,
						y,
						radius: mmToPx(4.5),
						fill: '#dbe3ec',
						stroke: '#94a3b8',
						strokeWidth: 1
					}),
					new Konva.Circle({
						x,
						y,
						radius: mmToPx(3),
						fill: '#ffffff',
						stroke: '#94a3b8',
						strokeWidth: 1
					}),
					new Konva.Line({
						points: [x - mmToPx(1.7), y, x + mmToPx(1.7), y],
						stroke: '#64748b',
						strokeWidth: mmToPx(1)
					}),
					new Konva.Line({
						points: [x, y - mmToPx(1.7), x, y + mmToPx(1.7)],
						stroke: '#64748b',
						strokeWidth: mmToPx(1)
					})
				);
			}
		}
		node.add(outline);
		node.on('mouseenter', () => {
			outline.stroke('#2563eb');
		});
		node.on('mouseleave', () => {
			if (!node.isDragging())
				outline.stroke(device.id === options.selectedId ? '#2563eb' : 'transparent');
		});
		node.on('contextmenu', (event) => {
			event.evt.preventDefault();
			event.cancelBubble = true;
			options.onContextMenu(device.id, event.evt);
		});
		node.on('click tap', (event) => {
			if ('button' in event.evt && event.evt.button !== 0) return;
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
			outline.stroke(valid ? '#2563eb' : '#ef4444');
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
				outline.stroke(device.id === options.selectedId ? '#2563eb' : 'transparent');
				onStatus('Move rejected: those units are occupied.');
			}
		});
		group.add(node);
		devices.set(device.id, node);
	}
	return { group, slots, devices };
}

import type { RackDevice, RackModel } from '$lib/rack/rackModel';

const UNIT_HEIGHT = 18;
const RACK_WIDTH = 300;
const RAIL_WIDTH = 16;
const CARD_WIDTH = 380;
const MAX_COLUMNS = 3;
const PAGE_MARGIN = 36;
const HEADER_HEIGHT = 92;
const RACK_HEADER_HEIGHT = 34;
const ROW_GAP = 52;
const SCHEDULE_ROW_HEIGHT = 26;

function escapeXml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&apos;'
		};
		return entities[character];
	});
}

function shorten(value: string, maximum: number): string {
	return value.length <= maximum ? value : `${value.slice(0, maximum - 1)}…`;
}

function rackRows(racks: RackModel[]): RackModel[][] {
	const rows: RackModel[][] = [];
	for (let index = 0; index < racks.length; index += MAX_COLUMNS)
		rows.push(racks.slice(index, index + MAX_COLUMNS));
	return rows;
}

function deviceCategory(device: RackDevice): 'server' | 'switch' | 'storage' {
	if (device.category) return device.category;
	if (/switch/i.test(device.name)) return 'switch';
	if (/storage|array|disk/i.test(device.name)) return 'storage';
	return 'server';
}

function deviceLabel(device: RackDevice): string {
	const endU = device.startU + device.sizeU - 1;
	return `${shorten(device.name, 28)} · U${device.startU}${endU === device.startU ? '' : `–U${endU}`}`;
}

function renderServer(device: RackDevice, x: number, y: number, width: number, height: number) {
	const markup = [
		`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="2" class="device-panel"/>`
	];
	if (height <= UNIT_HEIGHT) {
		for (let bay = 0; bay < 3; bay++)
			markup.push(
				`<rect x="${x + 6 + bay * 17}" y="${y + 4}" width="13" height="${Math.max(6, height - 8)}" rx="1" class="device-detail"/>`
			);
		markup.push(
			`<circle cx="${x + width - 14}" cy="${y + height / 2}" r="3.2" class="device-control"/>`,
			`<circle cx="${x + width - 26}" cy="${y + height / 2}" r="1.5" class="status-light"/>`,
			`<rect x="${x + 60}" y="${y + 2}" width="${width - 96}" height="${height - 4}" rx="2" class="label-plate"/>`,
			`<text x="${x + width / 2}" y="${y + height / 2 + 4}" class="device-label" text-anchor="middle">${escapeXml(deviceLabel(device))}</text>`
		);
		return markup;
	}

	const headerHeight = 18;
	markup.push(
		`<line x1="${x + 6}" y1="${y + headerHeight}" x2="${x + width - 6}" y2="${y + headerHeight}" class="device-detail"/>`,
		`<circle cx="${x + width - 16}" cy="${y + 9}" r="4" class="device-control"/>`,
		`<circle cx="${x + width - 30}" cy="${y + 9}" r="1.6" class="status-light"/>`
	);
	const rows = Math.max(1, Math.min(3, device.sizeU - 1));
	const rowHeight = (height - headerHeight) / rows;
	for (let row = 0; row < rows; row++) {
		const bayY = y + headerHeight + row * rowHeight + 3;
		for (let bay = 0; bay < 3; bay++)
			markup.push(
				`<rect x="${x + 7 + bay * 55}" y="${bayY}" width="48" height="${Math.max(5, rowHeight - 6)}" rx="1" class="device-detail"/>`
			);
	}
	markup.push(
		`<line x1="${x + width - 28}" y1="${y + headerHeight + 4}" x2="${x + width - 28}" y2="${y + height - 4}" class="device-detail"/>`,
		`<rect x="${x + 8}" y="${y + 3}" width="${width - 52}" height="12" rx="2" class="label-plate"/>`,
		`<text x="${x + (width - 44) / 2}" y="${y + 13}" class="device-label" text-anchor="middle">${escapeXml(deviceLabel(device))}</text>`
	);
	return markup;
}

function renderSwitch(device: RackDevice, x: number, y: number, width: number, height: number) {
	const markup = [
		`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="2" class="device-panel switch-panel"/>`
	];
	const portSize = Math.max(3, Math.min(6, height - 8));
	for (let port = 0; port < 12; port++)
		markup.push(
			`<rect x="${x + 6 + port * 7}" y="${y + (height - portSize) / 2}" width="5" height="${portSize}" rx="0.5" class="switch-port"/>`
		);
	markup.push(
		`<circle cx="${x + width - 12}" cy="${y + height / 2}" r="1.8" class="status-light"/>`,
		`<rect x="${x + 96}" y="${y + 2}" width="${width - 120}" height="${height - 4}" rx="2" class="label-plate"/>`,
		`<text x="${x + 96 + (width - 120) / 2}" y="${y + height / 2 + 4}" class="device-label" text-anchor="middle">${escapeXml(deviceLabel(device))}</text>`
	);
	return markup;
}

function renderStorage(device: RackDevice, x: number, y: number, width: number, height: number) {
	const markup = [
		`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="2" class="device-panel storage-panel"/>`
	];
	const rows = Math.max(1, Math.min(3, device.sizeU));
	const rowHeight = height / rows;
	for (let row = 0; row < rows; row++)
		for (let bay = 0; bay < 6; bay++)
			markup.push(
				`<rect x="${x + 6 + bay * 31}" y="${y + row * rowHeight + 3}" width="26" height="${Math.max(5, rowHeight - 6)}" rx="1" class="device-detail"/>`
			);
	markup.push(
		`<rect x="${x + 58}" y="${y + height / 2 - 7}" width="${width - 116}" height="14" rx="2" class="label-plate"/>`,
		`<text x="${x + width / 2}" y="${y + height / 2 + 4}" class="device-label" text-anchor="middle">${escapeXml(deviceLabel(device))}</text>`
	);
	return markup;
}

function renderDevice(device: RackDevice, x: number, y: number, width: number, height: number) {
	switch (deviceCategory(device)) {
		case 'switch':
			return renderSwitch(device, x, y, width, height);
		case 'storage':
			return renderStorage(device, x, y, width, height);
		default:
			return renderServer(device, x, y, width, height);
	}
}

export function createRackReferenceSvg(
	racks: RackModel[],
	options: { title?: string; generatedOn?: string } = {}
): string {
	const rows = rackRows(racks);
	const columns = Math.max(1, Math.min(MAX_COLUMNS, racks.length));
	const width = Math.max(760, PAGE_MARGIN * 2 + columns * CARD_WIDTH);
	let cursorY = HEADER_HEIGHT;
	const rackMarkup: string[] = [];

	for (const row of rows) {
		const rowUnits = Math.max(...row.map((rack) => rack.units));
		const rowBodyHeight = rowUnits * UNIT_HEIGHT;
		row.forEach((rack, column) => {
			const cardX = PAGE_MARGIN + column * CARD_WIDTH;
			const rackX = cardX + 42;
			const rackY = cursorY + RACK_HEADER_HEIGHT + (rowUnits - rack.units) * UNIT_HEIGHT;
			const rackHeight = rack.units * UNIT_HEIGHT;
			const installation = rack.installation === 'floor-stand' ? 'Floor stand' : 'Wall mount';
			rackMarkup.push(
				`<text x="${rackX + RACK_WIDTH / 2}" y="${rackY - 12}" class="rack-title" text-anchor="middle">${escapeXml(rack.name)} · ${rack.units}U · ${installation}</text>`,
				`<rect x="${rackX}" y="${rackY}" width="${RACK_WIDTH}" height="${rackHeight}" rx="3" class="rack-body"/>`,
				`<rect x="${rackX}" y="${rackY}" width="${RAIL_WIDTH}" height="${rackHeight}" class="rail"/>`,
				`<rect x="${rackX + RACK_WIDTH - RAIL_WIDTH}" y="${rackY}" width="${RAIL_WIDTH}" height="${rackHeight}" class="rail"/>`
			);

			for (let unit = 1; unit <= rack.units; unit++) {
				const unitY = rackY + (rack.units - unit) * UNIT_HEIGHT;
				rackMarkup.push(
					`<line x1="${rackX + RAIL_WIDTH}" y1="${unitY}" x2="${rackX + RACK_WIDTH - RAIL_WIDTH}" y2="${unitY}" class="unit-line"/>`,
					`<text x="${rackX - 8}" y="${unitY + 12}" class="unit-label" text-anchor="end">${unit}</text>`,
					`<circle cx="${rackX + RAIL_WIDTH / 2}" cy="${unitY + UNIT_HEIGHT / 2}" r="1.7" class="rail-hole"/>`,
					`<circle cx="${rackX + RACK_WIDTH - RAIL_WIDTH / 2}" cy="${unitY + UNIT_HEIGHT / 2}" r="1.7" class="rail-hole"/>`
				);
			}

			for (const device of rack.devices) {
				const deviceY = rackY + (rack.units - device.startU - device.sizeU + 1) * UNIT_HEIGHT;
				const deviceHeight = device.sizeU * UNIT_HEIGHT;
				rackMarkup.push(
					...renderDevice(
						device,
						rackX + RAIL_WIDTH,
						deviceY + 1,
						RACK_WIDTH - RAIL_WIDTH * 2,
						deviceHeight - 2
					)
				);
			}
		});
		cursorY += RACK_HEADER_HEIGHT + rowBodyHeight + ROW_GAP;
	}

	const devices = racks.flatMap((rack) =>
		rack.devices.map((device) => ({ rack: rack.name, device }))
	);
	const scheduleRows = Math.max(1, devices.length);
	const scheduleY = cursorY + 4;
	const tableX = PAGE_MARGIN;
	const tableWidth = width - PAGE_MARGIN * 2;
	const rackColumn = tableWidth * 0.28;
	const equipmentColumn = tableWidth * 0.72;
	const scheduleMarkup: string[] = [
		`<text x="${tableX}" y="${scheduleY}" class="section-title">Equipment schedule</text>`,
		`<rect x="${tableX}" y="${scheduleY + 14}" width="${tableWidth}" height="${SCHEDULE_ROW_HEIGHT}" class="table-header"/>`,
		`<text x="${tableX + 9}" y="${scheduleY + 32}" class="table-header-text">Rack</text>`,
		`<text x="${tableX + rackColumn + 9}" y="${scheduleY + 32}" class="table-header-text">Equipment</text>`,
		`<text x="${tableX + equipmentColumn + 9}" y="${scheduleY + 32}" class="table-header-text">Position</text>`
	];

	if (devices.length === 0) {
		scheduleMarkup.push(
			`<rect x="${tableX}" y="${scheduleY + 14 + SCHEDULE_ROW_HEIGHT}" width="${tableWidth}" height="${SCHEDULE_ROW_HEIGHT}" class="table-row"/>`,
			`<text x="${tableX + 9}" y="${scheduleY + 58}" class="table-text muted">No equipment installed</text>`
		);
	} else {
		devices.forEach(({ rack, device }, index) => {
			const y = scheduleY + 14 + SCHEDULE_ROW_HEIGHT * (index + 1);
			const endU = device.startU + device.sizeU - 1;
			scheduleMarkup.push(
				`<rect x="${tableX}" y="${y}" width="${tableWidth}" height="${SCHEDULE_ROW_HEIGHT}" class="table-row"/>`,
				`<line x1="${tableX + rackColumn}" y1="${y}" x2="${tableX + rackColumn}" y2="${y + SCHEDULE_ROW_HEIGHT}" class="table-rule"/>`,
				`<line x1="${tableX + equipmentColumn}" y1="${y}" x2="${tableX + equipmentColumn}" y2="${y + SCHEDULE_ROW_HEIGHT}" class="table-rule"/>`,
				`<text x="${tableX + 9}" y="${y + 18}" class="table-text">${escapeXml(shorten(rack, 34))}</text>`,
				`<text x="${tableX + rackColumn + 9}" y="${y + 18}" class="table-text">${escapeXml(shorten(device.name, 48))}</text>`,
				`<text x="${tableX + equipmentColumn + 9}" y="${y + 18}" class="table-text">U${device.startU}${endU === device.startU ? '' : `–U${endU}`} · ${device.sizeU}U</text>`
			);
		});
	}

	const height = scheduleY + 14 + SCHEDULE_ROW_HEIGHT * (scheduleRows + 1) + PAGE_MARGIN;
	const title = escapeXml(options.title ?? 'Rack Installation Reference');
	const generatedOn = escapeXml(options.generatedOn ?? new Date().toISOString().slice(0, 10));

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text { font-family: Inter, Arial, sans-serif; fill: #334155; }
    .page-title { font-size: 24px; font-weight: 700; fill: #172033; }
    .subtitle { font-size: 12px; fill: #64748b; }
    .rack-title { font-size: 14px; font-weight: 700; }
    .rack-body { fill: #16324f; stroke: #334155; stroke-width: 2; }
    .rail { fill: #cbd5e1; stroke: #64748b; stroke-width: 1; }
    .rail-hole { fill: #475569; }
    .unit-line { stroke: #67a9c7; stroke-width: 0.7; }
    .unit-label { font-size: 9px; font-weight: 700; fill: #64748b; }
    .device-panel { fill: #f8fafc; stroke: #334155; stroke-width: 1.5; }
    .switch-panel { fill: #e8eef5; }
    .storage-panel { fill: #eef2f6; }
    .device-detail { fill: none; stroke: #64748b; stroke-width: 1; }
    .device-control { fill: #fff; stroke: #334155; stroke-width: 1.2; }
    .status-light { fill: #22c55e; stroke: #15803d; stroke-width: 0.5; }
    .switch-port { fill: #334155; stroke: #0f172a; stroke-width: 0.5; }
    .label-plate { fill: #fff; fill-opacity: 0.94; stroke: #cbd5e1; stroke-width: 0.6; }
    .device-label { font-size: 11px; font-weight: 700; fill: #1e3a5f; }
    .section-title { font-size: 16px; font-weight: 700; fill: #172033; }
    .table-header { fill: #334155; }
    .table-header-text { font-size: 11px; font-weight: 700; fill: #fff; }
    .table-row { fill: #fff; stroke: #cbd5e1; stroke-width: 1; }
    .table-rule { stroke: #cbd5e1; stroke-width: 1; }
    .table-text { font-size: 11px; }
    .muted { fill: #64748b; }
  </style>
  <rect width="${width}" height="${height}" fill="#fff"/>
  <text x="${PAGE_MARGIN}" y="42" class="page-title">${title}</text>
  <text x="${PAGE_MARGIN}" y="64" class="subtitle">Front elevation · Installation reference · Not to scale</text>
  <text x="${width - PAGE_MARGIN}" y="42" class="subtitle" text-anchor="end">Generated ${generatedOn}</text>
  ${rackMarkup.join('\n  ')}
  ${scheduleMarkup.join('\n  ')}
</svg>`;
}

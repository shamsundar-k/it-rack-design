# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.17.0 create --template minimal --types ts --add prettier tailwindcss="plugins:forms,typography" --install pnpm it-rack-design
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Rack workspace

The workspace uses the original physical conversion: 482.6 mm = 600 logical pixels,
with 1U = 44.45 mm. `rackGeometry.ts` is shared by standalone servers and rack
rendering. View zoom is a separate Konva stage transform.

Equipment state contains `startU` (lowest occupied unit) and `sizeU`; positions are
derived inside each rack group. The page renders only the rack canvas. Drag equipment
to snap to free units; invalid moves revert. Drag the background to pan and use the
wheel to zoom. The canvas fits on initial load and viewport resize.
State is currently in memory and resets on reload. Rails reuse a 1U SVG tile with
three EIA-310-spaced visual holes (15.875 mm, 15.875 mm, then 12.7 mm to the next
unit). Equipment ears and fasteners align to the same hole centers and move with
the equipment.

Run `pnpm test` for geometry and occupancy tests (Node 22.6+), `pnpm check` for
Svelte/TypeScript validation, and `pnpm build` for the production build.

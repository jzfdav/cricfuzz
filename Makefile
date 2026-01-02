setup:
	pnpm install
	pnpm exec playwright install || true

build:
	pnpm build

dev:
	pnpm dev

test:
	pnpm test

e2e:
	pnpm test:e2e

check:
	pnpm lint
	pnpm typecheck
	pnpm test

ci:
	pnpm install --frozen-lockfile
	pnpm lint
	pnpm typecheck
	pnpm test
	pnpm test:e2e
	pnpm build

clean:
	rm -rf node_modules dist

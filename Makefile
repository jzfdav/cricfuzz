setup:
	pnpm install
	pnpm exec husky install
	pnpm exec playwright install || true

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

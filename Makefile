PRETTIER := ./node_modules/.bin/prettier
FORMAT_PATHS := \
	"src/**/*.{ts,tsx,js,jsx,css}" \
	"scripts/**/*.{mjs,js}" \
	"*.{json,mjs,ts}"

.PHONY: \
	install \
	format \
	lock-check \
	architecture lint typecheck \
	build \
	ci

install:
	npm ci --no-audit --fund=false

format:
	$(PRETTIER) --write $(FORMAT_PATHS)

lock-check:
	./scripts/ci/check-lock.sh

architecture:
	npm run check:architecture

lint:
	npm run lint

typecheck:
	npm run typecheck

build:
	npm run build

ci: lock-check install architecture lint typecheck build

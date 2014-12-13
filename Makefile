SRC = classes/*.js

TESTS = test/app

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		$(TESTS) \
		--bail

.PHONY: test
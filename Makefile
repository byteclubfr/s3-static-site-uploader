TESTS = test/*.js
REPORTER = dot

src-cov: clean-cov
	jscover --no-highlight src src-cov

test-cov: src-cov
	S3_UPLOAD_COV=1 mocha \
		--require ./test/bootstrap \
		--reporter html-cov \
		$(TESTS) \
		> coverage.html

clean: clean-cov

clean-cov:
	rm -rf src-cov
	rm -f coverage.html

clean-all: clean
	rm -rf node_modules


.PHONY: test test-cov
.PHONY: clean clean-cov clean-all

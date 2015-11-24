REPORTER=spec
MOCHA=node_modules/.bin/_mocha
ISTANBUL=node_modules/.bin/istanbul
JSHINT=node_modules/.bin/jshint
TESTFOLDER=testfiles/

BNUM:=$(BUILD)
ifeq ($(LINESCOVER),)
	LINE=80
else 
	LINE=$(LINESCOVER)
endif


TESTS=$(shell find $(TESTFOLDER) -name "*Tests.js" | sort)

test:
	@NODE_ENV=TEST \
		$(MOCHA) \
		-r expect.js \
		-R $(REPORTER) \
		--check-leaks \
		$(TESTS)

test-istanbul:
	@NODE_ENV=TEST \
		$(ISTANBUL) cover \
		-x "**/testfiles/**" \
		$(MOCHA) -- \
		-R $(REPORTER) \
		$(TESTS)

validate-coverage:
	$(ISTANBUL) check-coverage \
	--lines $(LINE) \
	--functions $(LINE)

setunittest:
    TESTFOLDER=unittest/
    TESTS=$(shell find $(TESTFOLDER) -name "*Tests.js" | sort)

unittest-ci:
	$(MAKE) setunittest
	XUNIT_FILE=tests-$(BNUM).xml $(MAKE) test REPORTER=xunit-file

unittest-cov:
	$(MAKE) setunittest
	XUNIT_FILE=tests-$(BNUM).xml $(MAKE) test-istanbul REPORTER=xunit-file

clean-ci:
	rm -f tests-*.xml


clean-cov:
	$(MAKE) clean-ci
	rm -rf coverage


clean:
	$(MAKE) clean-ci
	$(MAKE) clean-cov


.PHONY: 
	$(MAKE) clean
	$(MAKE) unittest-ci
	$(MAKE) unittest-cov


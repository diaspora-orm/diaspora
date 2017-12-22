'use strict';

/* globals l: false, it: false, describe: false, require: false, expect: false, beforeEach: false, afterEach: false */

const webdriver = require( 'selenium-webdriver' );
const path = require( 'path' );
const chai = require( 'chai' );
global.assert = chai.assert;
global.expect = chai.expect;

const getTestPath = fileName => {
	if ( !l.isNil( process.env.SAUCE_USERNAME )) {
		return `http://localhost:8000/test/browser/${ fileName }`;
	} else {
		return `file://${ path.resolve( __dirname, fileName ) }`;
	}
};
const SauceLabs = require( 'saucelabs' );

describe( `Test Diaspora in the browser (${ process.env.BROWSER_NAME || 'chrome' })`, function seleniumSuite() {
	this.timeout( 20000 );
	let browser;
	let passed;
	let saucelabs = new SauceLabs({
		username: process.env.SAUCE_USERNAME,
		password: process.env.SAUCE_ACCESS_KEY,
	});

	beforeEach(() => {
		passed = false;
		if ( !l.isNil( process.env.SAUCE_USERNAME )) {
			browser = new webdriver.Builder()
				.usingServer( `http://${  process.env.SAUCE_USERNAME  }:${  process.env.SAUCE_ACCESS_KEY  }@ondemand.saucelabs.com:80/wd/hub` )
				.withCapabilities({
					'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
					build:               `Diaspora n°${ process.env.TRAVIS_BUILD_NUMBER }`,
					username:            process.env.SAUCE_USERNAME,
					accessKey:           process.env.SAUCE_ACCESS_KEY,
					browserName:         process.env.BROWSER_NAME,
				}).build();
		} else {
			browser = new webdriver.Builder()
				.withCapabilities({
					browserName: 'chrome',
				}).build();
		}
	});

	afterEach(() => {
		if ( !l.isNil( process.env.SAUCE_USERNAME )) {
			return browser.getSession().then( session => {
				return saucelabs.updateJob( session.getId(), {
					passed,
					name: `Diaspora Browser ${ browser.currentBuild } build on ${ process.env.BROWSER_NAME }`,
				});
			}).catch( e => {
				console.error( e );
				return Promise.reject( e );
			}).finally(() => {
				return browser.quit();
			});
		} else {
			return browser.quit();
		}
	});

	it( 'Standalone version should pass tests', () => {
		browser.currentBuild = 'standalone';
		return browser.get( getTestPath( `${ browser.currentBuild  }.html` )).then(() => {
			return browser.findElements( webdriver.By.xpath( '//*[@id="mocha-report"]/*' ));
		}).then( reportChildren => {
			expect( reportChildren ).to.have.lengthOf.above( 0 );
			return browser.findElements( webdriver.By.className( 'fail' ));
		}).then( failed => {
			expect( failed ).to.have.lengthOf( 0 );
			passed = true;
		});
	});

	it( 'Isolated version should pass tests', () => {
		browser.currentBuild = 'isolated';
		return browser.get( getTestPath( `${ browser.currentBuild  }.html` )).then(() => {
			return browser.findElements( webdriver.By.xpath( '//*[@id="mocha-report"]/*' ));
		}).then( reportChildren => {
			expect( reportChildren ).to.have.lengthOf.above( 0 );
			return browser.findElements( webdriver.By.className( 'fail' ));
		}).then( failed => {
			expect( failed ).to.have.lengthOf( 0 );
			passed = true;
		});
	});
});

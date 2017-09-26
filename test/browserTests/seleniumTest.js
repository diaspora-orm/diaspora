var assert = require("assert");
var webdriver = require("selenium-webdriver");
var path = require('path');

describe("testing javascript in the browser", function() {
	beforeEach(function() {
//		this.timeout = 10000;
		let ret;
		if (process.env.SAUCE_USERNAME != undefined) {
			this.browser = new webdriver.Builder()
				.usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
				.withCapabilities({
				'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
				build: process.env.TRAVIS_BUILD_NUMBER,
				username: process.env.SAUCE_USERNAME,
				accessKey: process.env.SAUCE_ACCESS_KEY,
				browserName: "chrome"
			}).build();
			ret = this.browser.get("http://localhost:8000/test/browserTests/seleniumTest.html");
		} else {
			this.browser = new webdriver.Builder()
				.withCapabilities({
				browserName: "chrome"
			}).build();
			const url = 'file://'+path.resolve(__dirname, 'seleniumTest.html');
			ret = this.browser.get(url);
		}

		return ret;
	});

	afterEach(function() {
		return this.browser.quit();
	});

	it("should handle clicking on a headline", function() {
		this.timeout = 5000;
		var headline = this.browser.findElement(webdriver.By.css('h1'));

		headline.click();

		headline.getText().then(function(txt) {
			assert.equal(txt, "awesome");
		});
	});
});
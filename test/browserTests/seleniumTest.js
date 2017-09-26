var webdriver = require("selenium-webdriver");
var path = require('path');

const getTestPath = fileName => {
	if (process.env.SAUCE_USERNAME != undefined) {
		return `http://localhost:8000/test/browserTests/${fileName}`;
	} else {
		return 'file://'+path.resolve(__dirname, fileName);
	}
}
describe("Test Diaspora in the browser", function() {
	this.timeout(20000);
	let browser;
	let passed;

	beforeEach(() => {
		let ret;
		passed = false;
		if (process.env.SAUCE_USERNAME != undefined) {
			browser = new webdriver.Builder()
				.usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
				.withCapabilities({
				'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
				build: process.env.TRAVIS_BUILD_NUMBER,
				username: process.env.SAUCE_USERNAME,
				accessKey: process.env.SAUCE_ACCESS_KEY,
				browserName: "chrome"
			}).build();
		} else {
			browser = new webdriver.Builder()
				.withCapabilities({
				browserName: "chrome"
			}).build();
		}
	});

	afterEach(() => {
		if(process.env.SAUCE_USERNAME != undefined){
			const request = require('request');

			return new Promise((resolve, reject) => {
				request.put( `https://saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${process.env.TRAVIS_JOB_NUMBER}`, {
					json: {
						passed,
						name: "Diaspora Browser build"
					},
					auth: {
						user: process.env.SAUCE_USERNAME,
						pass: process.env.SAUCE_ACCESS_KEY,
						sendImmediately: false
					},
				}, (err, ...others) => {
					return browser.quit().then(() => {
						console.log({err, others});
						if(err){
							console.error(err);
							return reject(err);
						}
						return resolve();
					});
				});
			});
		} else {
			return browser.quit();
		}
	});

	it("Standalone version should pass tests", () => {
		return browser.get(getTestPath('standalone.html')).then(() => {
			return browser.findElements(webdriver.By.className('fail'));
		}).then(failed => {
			expect(failed).to.have.lengthOf(0);
			passed = true;
		});
	});

	it("Composed version should pass tests", () => {
		return browser.get(getTestPath('composed.html')).then(() => {
			return browser.findElements(webdriver.By.className('fail'));
		}).then(failed => {
			expect(failed).to.have.lengthOf(0);
			passed = true;
		});
	});
});
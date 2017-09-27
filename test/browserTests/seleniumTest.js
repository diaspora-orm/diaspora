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
				.forBrowser(process.env.BROWSER_NAME)
				.usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
				.withCapabilities({
				'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
				build: process.env.TRAVIS_BUILD_NUMBER,
				username: process.env.SAUCE_USERNAME,
				accessKey: process.env.SAUCE_ACCESS_KEY,
				browserName: process.env.BROWSER_NAME
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

			return browser.getSession().then(session => {
				const url = `https://saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${session.getId()}`;
				const args = {
					json: {
						passed,
						name: "Diaspora Browser build"
					},
					auth: {
						user: process.env.SAUCE_USERNAME,
						pass: process.env.SAUCE_ACCESS_KEY,
						sendImmediately: false
					},
				};
				return Promise.promisify(request.put)(url, args);
			}).catch(e => {
				console.error(e);
				return Promise.reject(e);
			}).finally(() => {
				return browser.quit()
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
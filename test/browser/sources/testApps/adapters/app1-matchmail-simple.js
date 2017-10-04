'use strict';

module.exports = function (adapter, data, tableName) {
	it('❌ Clear old data', function () {
		return adapter.deleteMany(tableName, {}).then(function () {
			return adapter.findMany(tableName, {});
		}).then(function (found) {
			expect(found).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(0);
			return Promise.resolve();
		});
	});
	it('✨ Insert test data', function insertTestData() {
		this.timeout(20000);
		return adapter.insertMany(tableName, data).then(function (entities) {
			expect(entities).to.be.a.set.of.dataStoreEntity(adapter, data).that.have.lengthOf(data.length);
			return Promise.resolve();
		});
	});
	var lastWithEmail = void 0;
	it('\uD83D\uDD0E Find last entity with an email (option ' + chalk.bold('skip') + ')', function () {
		//		process.exit();
		var index = 1;
		return new Promise(function (resolve, reject) {
			var loop = function loop() {
				expect(index).to.be.below(data.length, 'Oops, we looped over data length');
				return adapter.findOne(tableName, {}, {
					skip: index - 1
				}).then(function (entity) {
					if (!c.assigned(entity)) {
						return resolve();
					}
					if (entity.hasOwnProperty('email')) {
						return resolve(entity);
					}
					index++;
					return loop();
				}).catch(reject);
			};
			return loop();
		}).then(function (lastCompleteItem) {
			expect(index).to.be.equal(4, '4th item has email');
			expect(lastCompleteItem).to.be.a.dataStoreEntity(adapter);
			expect(lastCompleteItem).to.include.all.keys('ip_address', 'url', 'email');
			lastWithEmail = lastCompleteItem;
		});
	});
	it('✨ Insert a new record based on previous', function () {
		var newItem = l.pick(lastWithEmail, ['ip_address', 'email']);
		newItem.url = '/diaspora_app1';
		return adapter.insertOne(tableName, newItem).then(function (entity) {
			expect(entity).to.be.a.dataStoreEntity(adapter, newItem);
			return Promise.resolve();
		});
	});
	var ips = ['254.243.134.211', '249.7.97.150', '168.186.151.29'];
	var ipRecords = {};
	it('🔎 Get items with some test IPs', function () {
		return Promise.map(ips, function (ip) {
			return adapter.findMany(tableName, {
				ip_address: ip
			});
		}).then(function (results) {
			l.forEach(results, function (set, index) {
				expect(set).to.be.a.set.of.dataStoreEntity(adapter, {
					ip_address: ips[index]
				});
			});
			ipRecords = l.zipObject(ips, results);
		});
	});
	it('\uD83D\uDD03 Update those items with email (options ' + chalk.bold('skip') + ' & ' + chalk.bold('limit') + ')', function () {
		return Promise.map(l.keys(ipRecords), function (ip) {
			var records = ipRecords[ip];
			var emails = l(records).map('email').value();
			var lastSyncIdx = 0;
			var email = l(emails).compact().first();
			var promises = [];
			l.forEach(records.concat([{
				email: null
			}]), function (record, idx) {
				if (record.hasOwnProperty('email') && record.email !== email) {
					promises.push(adapter.updateMany(tableName, {
						ip_address: ip
					}, {
						email: email
					}, {
						skip: lastSyncIdx,
						limit: idx - lastSyncIdx
					}));
					email = record.email;
					lastSyncIdx = idx;
				}
			});
			return Promise.all(promises);
		}).then(function (results) {
			l.forEach(results, function (updates, index) {
				l.forEach(updates, function (update) {
					if (update.length > 0) {
						expect(update).to.be.a.set.of.dataStoreEntity(adapter, {
							ip_address: ips[index],
							email: update[0].email
						});
					}
				});
			});
			/*const out = l.zipObject(ips, results);
   console.log(out);*/
		});
	});
	var pageSize = 11;
	var page = 0;
	it('\uD83D\uDD0E Get items without email by page of ' + pageSize + ' (options ' + chalk.bold('page') + ' & ' + chalk.bold('skip') + ')', function () {
		return new Promise(function (resolve, reject) {
			var loop = function loop() {
				expect(page).to.be.below(Math.ceil(data.length / pageSize) + 1, 'Oops, we looped over data length');
				return Promise.props({
					page: adapter.findMany(tableName, {
						email: undefined
					}, {
						page: page,
						limit: pageSize
					}),
					skip: adapter.findMany(tableName, {
						email: undefined
					}, {
						skip: page * pageSize,
						limit: pageSize
					})
				}).then(function (queryRes) {
					expect(queryRes.page).to.be.deep.eql(queryRes.skip, '"page" & "skip" should return same data');
					var entities = queryRes.page;
					expect(entities).to.be.a.set.of.dataStoreEntity(adapter, {
						email: undefined
					}).that.have.lengthOf.below(pageSize + 1, 'Sets should be at most ' + pageSize + ' items length');
					if (0 == entities.length) {
						return resolve();
					}
					page++;
					return loop();
				}).catch(function (err) {
					return reject(err);
				});
			};
			return loop();
		});
	});
	var allItems = void 0;
	it('🔎 Find all items', function () {
		return adapter.findMany(tableName, {}, {
			limit: Infinity
		}).then(function (items) {
			expect(items).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(data.length + 1);
			allItems = items;
		});
	});
	it('\u274C Delete 2 pages (options ' + chalk.bold('page') + ' & ' + chalk.bold('limit') + ')', function () {
		return adapter.deleteMany(tableName, {}, {
			page: 3,
			limit: 20
		}).then(function () {
			return adapter.deleteMany(tableName, {}, {
				page: 2,
				limit: 5
			});
		}).then(function () {
			return adapter.findMany(tableName, {}, {
				limit: Infinity
			});
		}).then(function (items) {
			expect(items).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(data.length + 1 - (20 + 5));
			var idxRemoved = l([]).concat(l.times(5, Number).map(function (v) {
				return v + 10;
			}), l.times(20, Number).map(function (v) {
				return v + 60;
			})).value();
			l.pullAt(allItems, idxRemoved);
			expect(items).to.be.eql(allItems);
		});
	});
};

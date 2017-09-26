module.exports = (adapter, data, tableName) => {
	it('❌ Clear old data', () => {
		return adapter.deleteMany(tableName, {}).then(() => {
			return adapter.findMany(tableName, {});
		}).then(found => {
			expect(found).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(0);
			return Promise.resolve();
		});
	});
	it('✨ Insert test data', function insertTestData(){
		this.timeout(20000);
		return adapter.insertMany(tableName, data).then(entities => {
			expect(entities).to.be.a.set.of.dataStoreEntity(adapter, data).that.have.lengthOf(data.length);
			return Promise.resolve();
		});
	});
	let lastWithEmail;
	it(`🔎 Find last entity with an email (option ${chalk.bold('skip')})`, () => {
		//		process.exit();
		let index = 1;
		return new Promise((resolve, reject) => {
			const loop = () => {
				expect(index).to.be.below(data.length, 'Oops, we looped over data length');
				return adapter.findOne(tableName, {}, {skip: index - 1}).then(entity => {
					if(!c.assigned(entity)){
						return resolve();
					}
					if(entity.hasOwnProperty('email')){
						return resolve(entity);
					}
					index++;
					return loop();
				}).catch(reject);
			}
			return loop();
		}).then(lastCompleteItem => {
			expect(index).to.be.equal(4, '4th item has email');
			expect(lastCompleteItem).to.be.a.dataStoreEntity(adapter);
			expect(lastCompleteItem).to.include.all.keys('ip_address', 'url', 'email');
			lastWithEmail = lastCompleteItem;
		});
	});
	it('✨ Insert a new record based on previous', () => {
		const newItem = l.pick(lastWithEmail, ['ip_address', 'email']);
		newItem.url = '/diaspora_app1';
		return adapter.insertOne(tableName, newItem).then(entity => {
			expect(entity).to.be.a.dataStoreEntity(adapter, newItem);
			return Promise.resolve();
		});
	});
	const ips = ['254.243.134.211', '249.7.97.150', '168.186.151.29'];
	let ipRecords = {};
	it('🔎 Get items with some test IPs', () => {
		return Promise.map(ips, ip => {
			return adapter.findMany(tableName, {ip_address: ip})
		}).then(results => {
			l.forEach(results, (set, index) => {
				expect(set).to.be.a.set.of.dataStoreEntity(adapter, {ip_address: ips[index]});
			});
			ipRecords = l.zipObject(ips, results);
		});
	});
	it(`🔃 Update those items with email (options ${chalk.bold('skip')} & ${chalk.bold('limit')})`, () => {
		return Promise.map(l.keys(ipRecords), ip => {
			const records = ipRecords[ip];
			const emails = l(records).map('email').value();
			let lastSyncIdx = 0;
			let email = l(emails).compact().first();
			const promises = [];
			l.forEach(records.concat([{email: null}]), (record, idx) => {
				if(record.hasOwnProperty('email') && record.email !== email){
					promises.push(adapter.updateMany(tableName, {
						ip_address: ip
					}, {email}, {
						skip: lastSyncIdx,
						limit: idx - lastSyncIdx,
					}));
					email = record.email;
					lastSyncIdx = idx;
				}
			});
			return Promise.all(promises);
		}).then(results => {
			l.forEach(results, (updates, index) => {
				l.forEach(updates, update => {
					if(update.length > 0){
						expect(update).to.be.a.set.of.dataStoreEntity(adapter, {ip_address: ips[index], email: update[0].email});
					}
				});
			});
			/*const out = l.zipObject(ips, results);
			console.log(out);*/
		});
	});
	const pageSize = 11;
	let page = 0;
	it(`🔎 Get items without email by page of ${pageSize} (options ${chalk.bold('page')} & ${chalk.bold('skip')})`, () => {
		return new Promise((resolve, reject) => {
			const loop = () => {
				expect(page).to.be.below(Math.ceil(data.length / pageSize) + 1, 'Oops, we looped over data length');
				return Promise.props({
					page: adapter.findMany(tableName, {email: undefined}, {page, limit: pageSize}),
					skip: adapter.findMany(tableName, {email: undefined}, {skip: page * pageSize, limit: pageSize}),
				}).then(queryRes => {
					expect(queryRes.page).to.be.deep.eql(queryRes.skip, '"page" & "skip" should return same data');
					const entities = queryRes.page;
					expect(entities).to.be.a.set.of.dataStoreEntity(adapter, {email: undefined}).that.have.lengthOf.below(pageSize + 1, `Sets should be at most ${pageSize} items length`);
					if(entities.length == 0){
						return resolve();
					}
					page++;
					return loop();
				}).catch(err => reject(err));
			};
			return loop();
		});
	});
	let allItems;
	it(`🔎 Find all items`, () => {
		return adapter.findMany(tableName, {}, {limit: Infinity}).then(items => {
			expect(items).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(data.length + 1);
			allItems = items;
		})
	});
	it(`❌ Delete 2 pages (options ${chalk.bold('page')} & ${chalk.bold('limit')})`, () => {
		return adapter.deleteMany(tableName, {}, {page:3, limit: 20}).then(() => {
			return adapter.deleteMany(tableName, {}, {page:2, limit: 5});
		}).then(() => {
			return adapter.findMany(tableName, {}, {limit: Infinity});
		}).then(items => {
			expect(items).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(data.length + 1 - (20 + 5));
			const idxRemoved = l([]).concat(
				l.times(5, Number).map(v => v + 10),
				l.times(20, Number).map(v => v + 60)
			).value();
			l.pullAt(
				allItems,
				idxRemoved
			)
			expect(items).to.be.eql(allItems);
		});
	});
}
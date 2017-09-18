module.exports = (adapter, data, tableName) => {
	it('❌ Clear old data', () => {
		return adapter.deleteMany(tableName, {}).then(() => {
			return adapter.findMany(tableName, {});
		}).then(found => {
			expect(found).to.be.a.set.of.dataStoreEntity(adapter).that.have.lengthOf(0);
			return Promise.resolve();
		});
	});
	it('✨ Insert test data', () => {
		console.log(data);
		adapter.insertMany(tableName, data).then(entities => {
			expect(entities).to.be.a.set.of.dataStoreEntity(adapter, data).that.have.lengthOf(data.length);
			return Promise.resolve();
		});
	});
	let lastWithEmail;
	it(`🔎 Find last entity with an email (option ${chalk.bold('skip')})`, () => {
		process.exit();
		let index = 0;
		return new Promise((resolve, reject) => {
			const loop = () => {
				expect(index).to.be.below(data.length, 'Oops, we looped over data length');
				return adapter.findOne(tableName, {}, {skip: index}).then(entity => {
					console.log(entity);
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
			expect(index).to.be.above(1, 'First item should not match');
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
		});
	});
}
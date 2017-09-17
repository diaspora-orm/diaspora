'use strict';

const Promise = require('bluebird');

/* globals l: false, c: false */

function getDataSourceLabel(name){
	return name + 'Adapter';
}

const AdapterTestUtils = {
	createDataSource: (adapterLabel, config) => {
		const dataSourceLabel = getDataSourceLabel(adapterLabel);
		const dataSource = Diaspora.createDataSource( adapterLabel, config);
		dataSources[dataSourceLabel] = dataSource;
		return dataSource;
	},
	checkSpawnedAdapter: (adapterLabel, baseName) => {
		it( `Create ${adapterLabel} adapter`, done => {
			const dataSourceLabel = getDataSourceLabel(adapterLabel);
			dataSources[dataSourceLabel].waitReady().then( adapter => {
				expect( adapter ).to.be.an( 'object' );
				expect( adapter.constructor.name, 'Adapter name does not comply to naming convention' ).to.equal( `${baseName}DiasporaAdapter` );
				l.forEach(['insert', 'find', 'update', 'delete'], word => {
					expect( adapter ).to.satisfy( o => ( o.__proto__.hasOwnProperty(`${word}One`) || o.__proto__.hasOwnProperty(`${word}Many`) ), `should have at least one "${word}" method` );
				});
				expect( adapter.classEntity.name, 'Class entity name does not comply to naming convention' ).to.equal( `${baseName}Entity` );
				return done();
			}).catch( done );
		});
	},
	checkEachStandardMethods: adapterLabel => {
		const adapter = dataSources[getDataSourceLabel(adapterLabel)];
		const getTestLabel = fctName => {
			if(adapter.__proto__.hasOwnProperty(fctName)){
				return fctName;
			} else {
				return `${fctName} (from BaseAdapter)`;
			}
		};
		const validateEntity = (entity, props, adapter) => {
			l.forEach(props, (val, key) => {
				expect(entity).to.have.property(key, val);
			});
			expect(entity).to.include.all.keys('id', 'idHash');
			expect(entity.idHash).to.be.an('object').that.have.property(adapter.name, entity.id);
		}

		describe('Test adapter methods', () => {
			let findManyOk = false;
			let findAllOk = false;
			describe('Insert methods', () => {
				it(getTestLabel('insertOne'), () => {
					expect(adapter).to.respondTo('insertOne');
					const object = {foo: 'bar'};
					return adapter.insertOne('test', object).then(entity => {
						return Promise.try(() => {
							validateEntity(entity, object, adapter);
							return Promise.resolve();
						});
					});
				});
				it(getTestLabel('insertMany'), () => {
					expect(adapter).to.respondTo('insertMany');
					const objects = [{baz: 'qux'}, {qux: 'foo'}, {foo: 'bar'}];
					return adapter.insertMany('test', objects).then(entities => {
						return Promise.try(() => {
							expect(entities).to.be.an('array').that.have.lengthOf(objects.length);
							l.forEach(entities, (entity, index) => {
								validateEntity(entity, objects[index], adapter);
							});
							return Promise.resolve();
						});
					});
				});
			});
			describe('Find methods', () => {
				it(getTestLabel('findOne'), () => {
					expect(adapter).to.respondTo('findOne');
					return adapter.findOne('test', {baz: 'qux'}).then(entity => {
						return Promise.try(() => {
							validateEntity(entity, {baz: 'qux'}, adapter);
							return Promise.resolve();
						});
					});
				});
				it(getTestLabel('findMany'), () => {
					expect(adapter).to.respondTo('findMany');
					return adapter.findMany('test', {foo: 'bar'}).then(entities => {
						return Promise.try(() => {
							expect(entities).to.be.an('array').that.have.lengthOf(2);
							l.forEach(entities, (entity, index) => {
								validateEntity(entity, {foo: 'bar'}, adapter);
							});
							findManyOk = true;
							return Promise.resolve();
						});
					});
				});
				it('Find all', function skippable(){
					if(findManyOk !== true){
						this.skip();
						return;
					}
					expect(adapter).to.respondTo('findMany');
					return adapter.findMany('test', {}).then(entities => {
						return Promise.try(() => {
							expect(entities).to.be.an('array').that.have.lengthOf(4);
							l.forEach(entities, (entity, index) => {
								validateEntity(entity, {}, adapter);
							});
							findAllOk = true;
							return Promise.resolve();
						});
					});
				});
			});
			describe('Update methods', () => {
				it(getTestLabel('updateOne'), () => {
					expect(adapter).to.respondTo('updateOne');
					const fromObj = {baz: 'qux'};
					const targetObj = {foo: 'bar'};
					return adapter.updateOne('test', fromObj, targetObj).then(entity => {
						return Promise.try(() => {
							validateEntity(entity, l.assign({}, fromObj, targetObj), adapter);
							return Promise.resolve();
						});
					});
				});
				it(getTestLabel('updateMany'), () => {
					expect(adapter).to.respondTo('updateMany');
					const fromObj = {foo: 'bar'};
					const targetObj = {baz: 'qux'};
					return adapter.updateMany('test', fromObj, targetObj).then(entities => {
						return Promise.try(() => {
							expect(entities).to.be.an('array').that.have.lengthOf(3);
							l.forEach(entities, (entity, index) => {
								validateEntity(entity, l.assign({}, fromObj, targetObj), adapter);
							});
							return Promise.resolve();
						});
					});
				});
			});
			describe('Delete methods', () => {
				it(getTestLabel('deleteOne'), () => {
					expect(adapter).to.respondTo('deleteOne');
					const obj = {qux: 'foo'};
					return adapter.deleteOne('test', obj).then((...args) => {
						expect(args).to.be.an('array').that.eql([undefined]);
						return Promise.resolve();
					});
				});
				it(getTestLabel('deleteMany'), () => {
					expect(adapter).to.respondTo('deleteMany');
					const obj = {foo: 'bar'};
					return adapter.deleteMany('test', obj).then((...args) => {
						expect(args).to.be.an('array').that.eql([undefined]);
						return Promise.resolve();
					});
				});
				it('Check deletion: find all again', function skippable(){
					if(findAllOk !== true){
						this.skip();
						return;
					}
					return adapter.findMany('test', {}).then(entities => {
						return Promise.try(() => {
							expect(entities).to.be.an('array').that.have.lengthOf(0);
							return Promise.resolve();
						});
					});
				})
			});
		});
	},
	checkRegisterAdapter: (adapterLabel, dataSourceName) => {
		it( `Register named ${adapterLabel} dataSource`, () => {
			const namespace = 'test';
			Diaspora.registerDataSource( namespace, dataSourceName, dataSources[getDataSourceLabel(adapterLabel)] );
			//console.log(Diaspora.dataSources);
			expect( Diaspora.dataSources[namespace][dataSourceName] ).to.eql(dataSources[getDataSourceLabel(adapterLabel)]);
		});
	},
};

module.exports = AdapterTestUtils;
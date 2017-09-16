'use strict';

function getDataSourceLabel(name){
	return name + 'Adapter';
}

const AdapterTestUtils = {
	checkSpawnedAdapter: (adapterLabel, config, baseName) => {
		it( `Create ${adapterLabel} adapter`, done => {
			const dataSourceLabel = getDataSourceLabel(adapterLabel);
			dataSources[dataSourceLabel] = Diaspora.createDataSource( adapterLabel, config);
			dataSources[dataSourceLabel].waitReady().then( adapter => {
				console.log(dataSources, adapter);
				expect( adapter ).to.be.an( 'object' );
				expect( adapter.constructor.name, 'Adapter name does not comply to naming convention' ).to.equal( `${baseName}DiasporaAdapter` );
				l.forEach(['insert', 'find', 'update', 'delete'], word => {
					expect( adapter ).to.satisfy( o => ( o.hasOwnProperty(`${word}One`) ) || ( o.hasOwnProperty(`${word}Many`) ), `should have at least one "${word}" method` );
				});
				expect( adapter.classEntity.name, 'Class entity name does not comply to naming convention' ).to.equal( `${baseName}Entity` );
				return done();
			}).catch( done );
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
# Create a custom adapter

Creating an adapter for Diaspora is a process in 3 steps:

* First, get the development version of Diaspora. It will provide you some usefull tools for your development.
* Then, you have to create the adapter itself, that connects to your data source and interacts with it.
* Finally, create some tests to ensure your adapter will works correctly on as many situations as possible.

This page will guide you for each steps.

## Set up your environment

On a new NodeJS project, install Diaspora from both the development configuration and the production:

<div class="tabs tabs-code" markdown="1">
<div class="tab" data-ref="npm" markdown="1">

### Using NPM

```sh
# Install latest dev version
npm install -D git+ssh://git@github.com:@diaspora/diaspora
```

</div>
<div class="tab" data-ref="yarn" markdown="1">

### Using Yarn

```sh
# Install latest dev version
yarn add git+ssh://git@github.com:@diaspora/diaspora
```

</div>
</div>

Then, because your adapter is a *plugin* for Diaspora, add **Diaspora** as a [peerDependency](https://nodejs.org/en/blog/npm/peer-dependencies/).
Note that the first version of Diaspora that supports adding an adapter is version `0.2.0`. Your `package.json` should be something like:

```json
{
	"devDependencies": {
		"@diaspora/diaspora": "git+ssh://git@github.com:@diaspora/diaspora"
	},
	"peerDependencies": {
		"@diaspora/diaspora": ">= 0.3.0"
	}
}
```

Of course, you should idealy check the latest stable version.

## Write the adapter

```ts
import { Dictionary } from 'lodash';

import { Diaspora, Adapter, QueryLanguage } from '@diaspora/diaspora';
import { IEntityProperties, IEntityAttributes } from '@diaspora/diaspora/dist/types/types/entity';
import AAdapter = Adapter.Base.AAdapter;
import AAdapterEntity = Adapter.Base.AAdapterEntity;

export namespace MyAdapter {
	export class MySourceAdapter extends AAdapter<MySourceEntity> {
		public constructor( dataSourceName: string, ...adapterArgs: any[] ) {
			super( MySourceEntity, dataSourceName );
		}

		public configureCollection(
			tableName: string,
			remaps: _.Dictionary<string> = {},
			filters: _.Dictionary<any> = {}
		) {
			// Call parent `configureCollection` to store remappings & filters
			super.configureCollection( tableName, remaps, filters );
			// Then, create your schema.
			// Once you are done, don't forget to do one of the following:
			this.emit( 'ready' ); // Everything is okay
			this.emit( 'error', new Error() ); // An error happened

			return this;
		}

		// Implement at least one method of each couple
		// Insertion
		public async insertOne(
			table: string,
			entity: IEntityAttributes
		): Promise<IEntityProperties | undefined>{
			throw new Error( 'Not implemented' );
		}
		public async insertMany( table: string, entities: IEntityAttributes[] ): Promise<IEntityProperties[]>{
			throw new Error( 'Not implemented' );
		}

		// Search
		public async findOne(
			table: string,
			queryFind: QueryLanguage.SelectQueryOrCondition,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties | undefined>{
			throw new Error( 'Not implemented' );
		}
		public async findMany(
			table: string,
			queryFind: QueryLanguage.SelectQueryOrCondition,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties[]> {
			throw new Error( 'Not implemented' );
		}

		// Update
		public async updateOne(
			table: string,
			queryFind: QueryLanguage.SelectQueryOrCondition,
			update: IEntityAttributes,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties | undefined> {
			throw new Error( 'Not implemented' );
		}
		public async updateMany(
			table: string,
			queryFind: QueryLanguage.SelectQueryOrCondition,
			update: IEntityAttributes,
			options: QueryLanguage.IQueryOptions
		): Promise<IEntityProperties[]> {
			throw new Error( 'Not implemented' );
		}

		// Deletion
		public async deleteOne(
			table: string,
			queryFind: QueryLanguage.SelectQueryOrCondition,
			options: QueryLanguage.IQueryOptions
		): Promise<void> {
			throw new Error( 'Not implemented' );
		}
		public async deleteMany(
			table: string,
			queryFind: QueryLanguage.SelectQueryOrCondition,
			options: QueryLanguage.IQueryOptions
		): Promise<void> {
			throw new Error( 'Not implemented' );
		}
	}

	// Define options or adapter-specific types here.
	export namespace MySourceAdapter {
	}


	// This class allows you to define custom logic with your datastore entity
	export class MySourceEntity extends AAdapterEntity {
		public constructor( entity: IEntityProperties, dataSource: AAdapter ) {
			super( entity, dataSource );
		}
	}
}

Diaspora.registerAdapter( 'my-adapter', MyAdapter.MySourceAdapter );
```

If you are planning to deploy your adapter on the client side, note that async functions are not really [widely supported](http://caniuse.com/#feat=async-functions), and you probably should either transform your adapter using bundlers or transscripters like [Babel](https://babeljs.io/) or use [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) instead.

You are ready to go! Don't hesitate to post your adapters link on this page, or edit the Diaspora's README at the [Adapters section](https://github.com/GerkinDev/Diaspora#available-adapters).


## Execute some standard tests

Now that your adapter is ready, you need to test it. Diaspora provides some ways to check that your adapter behave as expected. Here is a basic template:

```ts
import { createDataSource, checkSpawnedAdapter, checkEachStandardMethods, checkApplications } from '@diaspora/diaspora/test/unit-test/adapters/utils';

const ADAPTER_LABEL = 'inMemory';

createDataSource( ADAPTER_LABEL, {} );
checkSpawnedAdapter( ADAPTER_LABEL );
checkEachStandardMethods( ADAPTER_LABEL );
checkApplications( ADAPTER_LABEL );
```

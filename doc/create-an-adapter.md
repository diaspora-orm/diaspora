---
layout: default
title: Create a custom adapter
description: "Need to use a data-source that is not supported yet? No problem: follow this guide and you'll be ready to create your very own adapter for Diaspora."
inMenu: true
---

# Create a custom adapter

Creating an adapter for Diaspora is a process in 3 steps:
* First, get the development version of Diaspora. It will provide you some usefull tools for your development.
* Then, you have to create the adapter itself, that connects to your data source and interacts with it.
* Finally, create some tests to ensure your adapter will works correctly on as many situations as possible.

This page will guide you for each steps.

## Set up your environment

On a new NodeJS project, install Diaspora from both the development configuration and the production:

<div class="tabs tabs-code">
<div class="tab" data-ref="npm">

### Using NPM

{% highlight bash %}
# Install latest dev version
npm install --save-dev {{ site.github.clone.ssh }}
{% endhighlight %}

</div>
<div class="tab" data-ref="yarn">

### Using Yarn

{% highlight bash %}
# Install latest dev version
yarn add {{ site.github.clone.ssh }}
{% endhighlight %}

</div>
</div>

Then, because your adapter is a *plugin* for Diaspora, add **Diaspora** as a [peerDependency](https://nodejs.org/en/blog/npm/peer-dependencies/).
Note that the first version of Diaspora that supports adding an adapter is version `0.2.0`, so your `package.json` should be something like:

{% highlight json %}
{
	"devDependencies": {
		"diaspora": "git+ssh://git@github.com:GerkinDev/Diaspora.git"
	},
	"peerDependencies": {
		"diaspora": ">= 0.2.0"
	}
}
{% endhighlight %}

## Write the adapter

{% highlight javascript %}
'use strict';

const {
	_, Promise,
} = require( 'diaspora/lib/dependencies' );

const DiasporaAdapter = require( 'diaspora/lib/adapters/baseAdapter.js' );
const DataStoreEntity = require( 'diaspora/lib/dataStoreEntities/baseEntity.js' );

// This class allows you to define custom logic with your datastore entity
class MyEntity extends DataStoreEntity {
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

// Your adapter logic.
class MyDiasporaAdapter extends DiasporaAdapter {
	constructor( config ) {
		super( MyEntity );
	}

	configureCollection( tableName, remaps ) {
		// Call parent `configureCollection` to store remappings & filters
		super.configureCollection( tableName, remaps );
		// Then, create your schema.
		// Once you are done, don't forget to do one of the following:
		this.emit( 'ready' ); // Everything is okay
		this.emit( 'error', new Error()); // An error happened
	}

	// Implement at least one method of each couple
	// Insertion
	async insertOne( table, entity ) {}
	async insertMany( table, entity ) {}
	// Search
	async findOne( table, queryFind, options ) {}
	async findMany( table, queryFind, options ) {}
	// Update
	async findOne( table, queryFind, update, options ) {}
	async findMany( table, queryFind, update, options ) {}
	// Deletion
	async deleteOne( table, queryFind, options ) {}
	async deleteMany( table, queryFind, options ) {}
}

// Here, give a name to your adapter, and register it in Diaspora
// You should check for the environment variable DISABLE_AUTOLOAD_DIASPORA_ADAPTERS.
if( !process.env.DISABLE_AUTOLOAD_DIASPORA_ADAPTERS ){
 require( 'diaspora' ).registerAdapter( 'my-adapter', MyDiasporaAdapter );
}

// Optionnally, you can export it
module.exports = MyDiasporaAdapter;
{% endhighlight %}

If you are planning to deploy your adapter on the client side, note that async functions are not really [widely supported](http://caniuse.com/#feat=async-functions), and you probably should either transform your adapter using [Babel](https://babeljs.io/) or use [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) instead.

You are ready to go! Don't hesitate to post your adapters link on this page, or edit the Diaspora's README at the [Adapters section](https://github.com/GerkinDev/Diaspora#available-adapters).


## Execute some standard tests

Now that your adapter is ready, you need to test it. Diaspora provides some ways to check that your adapter behave as expected. Here is a basic template:

{% highlight javascript %}
'use strict';

const AdapterTestUtils = require( 'diaspora/test/adapters/utils' );
const ADAPTER_LABEL = 'myAdapter';
const CONFIG_HASH = {/* Configure your adapter here */};
const ADAPTER_PREFIX_CAPITALIZED = 'MyAdapter';
const DATA_SOURCE_NAME = 'myDataSource';

const adapter = AdapterTestUtils.createDataSource( ADAPTER_LABEL, CONFIG_HASH);
AdapterTestUtils.checkSpawnedAdapter( ADAPTER_LABEL, ADAPTER_PREFIX_CAPITALIZED );
AdapterTestUtils.checkEachStandardMethods( ADAPTER_LABEL );
AdapterTestUtils.checkApplications( ADAPTER_LABEL );
AdapterTestUtils.checkRegisterAdapter( ADAPTER_LABEL, DATA_SOURCE_NAME );
{% endhighlight %}


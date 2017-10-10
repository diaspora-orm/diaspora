---
layout: default
title: Create a custom adapter
description: "Need to use a data-source that is not supported yet? No problem: follow this guide and you'll be ready to create your very own adapter for Diaspora."
inMenu: true
---

# Create a custom adapter

Here is a template to create your own custom adapters.

{% highlight javascript %}
'use strict';

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
	constructor() {
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
Diaspora.registerAdapter( 'my-adapter', MyDiasporaAdapter );

// Optionnally, you can export it
module.exports = MyDiasporaAdapter;
{% endhighlight %}

If you are planning to deploy your adapter on the client side, note that async functions are not really [widely supported](http://caniuse.com/#feat=async-functions), and you probably should either transform your adapter using [Babel](https://babeljs.io/) or use [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) instead.

You are ready to go! Don't hesitate to post your adapters link on this page, or edit the Diaspora's README at the [Adapters section](https://github.com/GerkinDev/Diaspora#available-adapters).
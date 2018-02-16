---
layout: default
title: Getting started
description: Get started with Diaspora NodeJS & Browser ORM in 5 minutes. These quick steps will help you to create your own models on your own data-sources.
inMenu: true
toc: true
---

# Getting started

## Install Diaspora

Diaspora is available on both the browser & Node.JS. Follow these steps to include Diaspora in your app:

### For Node.JS

First, install the package (and add it to your project's *dependencies*). You can use either NPM or Yarn ([I won't judge](https://hackernoon.com/its-ok-to-not-use-yarn-f28dc766ef32)).

<div class="tabs tabs-code">
<div class="tab" data-ref="npm">

#### With NPM

{% highlight shell %}
npm install @diaspora/diaspora
{% endhighlight %}
</div>

<div class="tab" data-ref="yarn">

#### With Yarn

{% highlight shell %}
yarn add @diaspora/diaspora
{% endhighlight %}
</div>
</div>

Once installed, simply load it using *Node*'s `require`

{% highlight javascript %}
const Diaspora = require( '@diaspora/diaspora' ).Diaspora;
{% endhighlight %}

If you are using Typescript (which I personaly recommend), do the following:

{% highlight typescript %}
import { Diaspora } from '@diaspora/diaspora';
{% endhighlight %}

### For the browser

Diaspora for the browser is built in 2 versions:

#### Standalone

This build contains Diaspora and all of its dependencies, packaged in a single (*big*) script file. You may prefer to use this file if you want to load Diaspora on every page of your site, or if you don't want to worry with loading each dependencies.

{% highlight html %}
<html>
	<head><!-- Your document's `head` --></head>
	<body>
		<!-- Your page content -->
		<script type="text/javascript" src="diaspora.min.js"></script>
		<script type="text/javascript" src="..."></script><!-- Load here your main page script. -->
	</body>
</html>
{% endhighlight %}

> This build export following libraries through the `Diaspora.dependencies` hash:
  * [lodash](https://lodash.com/)
  * [bluebird](http://bluebirdjs.com/docs/getting-started.html)
  * [sequential-event](https://www.npmjs.com/package/sequential-event)

#### Isolated

This version, much lighter, requires that you load each dependencies before loading Diaspora. You may use this version if you use Diaspora on some pages only, but you want some libraries (such as `lodash` or `bluebird`) to be loaded everywhere. You'll improve your overall performance by using efficiently the browser cache.

{% highlight html %}
<html>
	<head><!-- Your document's `head` --></head>
	<body>
		<!-- Your page content -->
		<script type="text/javascript" src="lodash.min.js"></script>
		<script type="text/javascript" src="bluebird.min.js"></script>
		<script type="text/javascript" src="check-types.min.js"></script>
		<script type="text/javascript" src="sequential-event.min.js"></script>
		<script type="text/javascript" src="diaspora.min.js"></script>
		<script type="text/javascript" src="..."></script><!-- Load here your main page script. -->
	</body>
</html>
{% endhighlight %}

## Use Diaspora

**Here we finally are**. Now *Diaspora* is available in your app. You just have to configure and use it.

### Create a data source

Data sources are named reference to a single way to get datas. You may then have at least one source for each of your databases, in each of your database software.

Basic syntax to declare a data source is like bellow:
{% highlight javascript %}
Diaspora.createNamedDataSource( 'myDataSource', 'inMemory', {} );
{% endhighlight %}

<div class="note">
Diaspora.**[createNamedDataSource](jsdoc/Diaspora.html#.createNamedDataSource__anchor)**(*string* `sourceName`, *string* `adapterLabel`, *Object* `configHash`) ► *Adapters.DiasporaAdapter*
</div>

* Data source names have to be unique. They are identifiers for this adapter that you will use later in your models.
* Adapter labels are the name that identifies each database type or data sources. You can get a list of adapters by checking the Diaspora's [adapters](jsdoc/Diaspora.html#.adapters__anchor) property.
* The configuration object depends on your adapter. Check the adapter documentation for infos about what you can set in this object.

### Working with models

Interactions with your data sources is done through **Models**. Models will allow you to manage your complete collection, and retrieve or create *entities*.

#### Create a model

To create a model, use the `declareModel`'s *Diaspora* method.

<div class="note">
Diaspora.**[declareModel](jsdoc/Diaspora.html#.declareModel__anchor)**( *string* `name`, *Object* `modelDesc`) ► *[Model](jsdoc/Model.html)*
</div>

Let's create a **model** describing a phone book, with a name, a phone, an email and a numeric index.

{% highlight javascript %}
const PhoneBook = Diaspora.declareModel( 'PhoneBook', {
	sources:    [ 'myDataSource' ],
	attributes: {
		name: {
			type: 'string',
		},
		phone: 'string',
		email: {
			type: 'string',
		},
		index: {
			type: 'integer',
		}
	},
});
{% endhighlight %}

`PhoneBook` is now an instance of **[Model](jsdoc/Model.html)**.

You can see more infos about how to configure a model [here](#)

#### Using models

With this model, you'll be able to retrieve or create entities, or perform bulk operations on your whole collection. Remember that a single model can use different storage locations, so be careful to keep your data coherent at every moment (according to the Consistancy requirement of ACID database properties).

{% highlight javascript %}
PhoneBook.insert({name: 'John Doe', phone: '555-623-987', index: 1}).then(/**
 * Create a sinhle entity in the default data source
 **/);
PhoneBook.insertMany([
	{name: 'Foo Bar', phone: '555-125-428', index: 2},
	{name: 'Baz Qux', email: 'bazqux@foomail.com', index: 3},
], 'PermanentStorage').then(/**
 * Create 2 entities in a specific data source
 **/);
PhoneBook.find({index: 2}).then(/**
 * Find a single entity in default data source, with `index` equals to 2
 **/);
 PhoneBook.findMany(/* query, options, dataSource*/);
 PhoneBook.update(/* query, update, options, dataSource*/);
 PhoneBook.updateMany(/* query, update, options, dataSource*/);
 PhoneBook.delete(/* query, options, dataSource*/);
 PhoneBook.deleteMany(/* query, options, dataSource*/);
{% endhighlight %}

<a href="query-language.html" class="btn">Learn more about *Query Language*</a>

Methods `insert`, `find` and `update` will return Entities, and `insertMany`, `findMany` and `updateMany` will return collections of Entities (for now, collections are just arrays).

### Working with entities

Entities are objects with a status, some data sources related informations, and their own methods.

 * Status of an entity can be checked using `getStatus()`.  Currently, there are 3 status implemented:
   1. `orphan`: This entity does not exists in any data source. `getLastDataSource()` should return `null` if entity is spawned, or the data source it was deleted from if destroyed.
   1. `syncing`: Entity is performing operations to be synced with your data source. At this point, `getLastDataSource()` will return your data source name.
   1. `sync`: The entity exists in at least one data source.
 * You can check your entity status in each data sources it is aware of by inspecting the `dataSources` property. This hash contains the `DataSourceEntity` for each sources. You can also know which data source was lastly used by using `lastDataSource()`
 * You can use methods to help you working with your Entities. Custom methods can be added by setting the `methods` hash in the model configuration.

#### Create, retrieve & manage entities

##### Entities

You can get Entities from model methods. Query methods `insert`, `find` and `update` will return an [entity](jsdoc/Entity.html) in a *sync* status. You can also create *orphan* entities with `spawn`.

Entities can be saved to a specific data source with **[persist](jsdoc/Entity.html#persist)**([*string* `sourceName`]) ► *Promise*
You can reload your entity from a specific data source by using **[fetch](jsdoc/Entity.html#fetch)**([*string* `sourceName`]) ► *Promise*
Lastly, you can decide to remove your entity from your data source with **[destroy](jsdoc/Entity.html#destroy)**([*string* `sourceName`]) ► *Promise*

##### Sets

Query methods `insertMany`, `findMany` and `updateMany` return [sets](jsdoc/Set.html). Sets are a convinient way to manage several entities at the same time. You can also spawn a set using `spawnMulti`.

Sets have the same methods than Entities, plus `update`. This method allow you to set provided attributes of all entities from this set.

#### Validation methods

> Well... Diaspora is very young, and validations are not yet integrated. Some validation methods are nevertheless available in the `Diaspora` object.
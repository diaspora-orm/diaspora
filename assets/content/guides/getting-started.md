# Getting started

## Install Diaspora

Diaspora is available on both the browser & Node.JS. Follow these steps to include Diaspora in your app:

### For *Node.js* or the *browser* (through a bundler)

For *Node.js*, node will automatically pick the node build for you.
[*webpack*](https://webpack.js.org/), [*rollup*](https://rollupjs.org/guide/en), and other bundler supporting the `package.json`'s `browser` fields will use the browser build. You might need to configure it manually on *more original* bundlers.

First, install the package (and add it to your project's *dependencies*). You can use either NPM or Yarn ([I won't judge](https://hackernoon.com/its-ok-to-not-use-yarn-f28dc766ef32)).

<div class="tabs tabs-code" markdown="1">
<div class="tab" data-ref="npm" markdown="1">

#### With NPM

```sh
npm install @diaspora/diaspora
```

</div>

<div class="tab" data-ref="yarn" markdown="1">

#### With Yarn

```sh
yarn add @diaspora/diaspora
```

</div>
</div>

Once installed, simply import it.

```ts
import { Diaspora } from '@diaspora/diaspora';
```

If you are not using Typescript, do the following:

```js
const Diaspora = require( '@diaspora/diaspora' ).Diaspora;
```

### For the browser

Diaspora for the browser is built in 2 versions:

#### The modern: `ESM` (EcmaScript Module, recommended)

This version, much lighter, requires that you load each dependencies before loading Diaspora. You may use this version if you use Diaspora on some pages only, but you want some libraries (such as `lodash`) to be loaded everywhere. You'll improve your overall performance by using efficiently the browser cache.

```html
<html>
	<head><!-- Your document's `head` --></head>
	<body>
		<!-- Your page content -->
		<script type="text/javascript" src="lodash.min.js" type="module" defer></script>
		<script type="text/javascript" src="sequential-event.min.js" type="module" defer></script>
		<script type="text/javascript" src="diaspora.esm.js" type="module" defer></script>
		<script type="text/javascript" src="..."></script><!-- Load here your main page script. -->
	</body>
</html>
```

#### The legacy: `IIFE` (*Immediately Invoked Function Expression*)

This build contains Diaspora and all of its dependencies, packaged in a single (*big*) script file. This build is made for legacy, and you should preferably use the ESM module instead if your target audience have recent-enough browsers.

```html
<html>
	<head><!-- Your document's `head` --></head>
	<body>
		<!-- Your page content -->
		<script type="text/javascript" src="diaspora.iife.js" defer></script>
		<script type="text/javascript" src="..." defer></script><!-- Load here your main page script. -->
	</body>
</html>
```

This script file automatically exposes [`DiasporaStatic`] as the global `Diaspora`.

## Use Diaspora

**Here we finally are**. Now *Diaspora* is available in your app. You just have to configure and use it.

### Create a data source

Data sources are named reference to a single way to get datas. You may then have at least one source for each of your databases, in each of your database software.

Basic syntax to declare a data source is like bellow:

```ts
Diaspora.createNamedDataSource( 'myDataSource', 'inMemory', {} );
```

<div class="note">
Diaspora.<b><a href="/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FDiasporaStatic#createNamedDataSource" target="_blank">createNamedDataSource</a></b>(<em>string</em> <code>sourceName</code>, <em>string</em> <code>adapterLabel</code>, <em>any[]</em> <code>otherConfig...</code>) ► <b><a href="/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FAdapters%2FDataAccessLayer" target="_blank">DataAccessLayer</a></b>
</div>

* Data source names have to be unique. They are identifiers for this adapter that you will use later in your models.
* Adapter labels are the name that identifies each database type or data sources. You can get a list of adapters by checking the Diaspora's [adapters](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FDiasporaStatic#adapters) property.
* The next parameters depends on your adapter. Check the adapter documentation for infos about what you can set in this object.

### Working with models

Interactions with your data sources is done through **Models**. Models will allow you to manage your complete collection, and retrieve or create *entities*.

#### Create a model

To create a model, use the `declareModel`'s *Diaspora* method.

<div class="note" markdown="1">
Diaspora.<b><a href="/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FDiasporaStatic#declareModel" target="_blank">declareModel</a></b>&lt;<code>TEntity</code>&gt;(<em>string</em> <code>name</code>, <em>IModelDescription</em> <code>modelDesc</code>, <em>any[]</em> <code>otherConfig...</code>) ► <b><a href="/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FAdapters%2FModel" target="_blank">Model</a></b>
</div>

Let's create a **model** describing a phone book, with a name, a phone, an email and a numeric index.

```ts
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
```

`PhoneBook` is now an instance of **[Model](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel)**.

<!-- You can see more infos about how to configure a model [here](#) -->

#### Using models

With this model, you'll be able to retrieve or create entities, or perform bulk operations on your whole collection. Remember that a single model can use different storage locations, so be careful to keep your data coherent at every moment (according to the Consistancy requirement of ACID database properties).

```ts
// Create a single entity in the default data source
await PhoneBook.insert({name: 'John Doe', phone: '555-623-987', index: 1});
// Create 2 entities in a specific data source
const newItems = await PhoneBook.insertMany([
	{name: 'Foo Bar', phone: '555-125-428', index: 2},
	{name: 'Baz Qux', email: 'bazqux@foomail.com', index: 3},
], 'PermanentStorage');

// Find a single entity in default data source, with `index` equals to 2
const foundItem = await PhoneBook.find({index: 2});
const foundItems = await PhoneBook.findMany(/* query, options, dataSource*/);

const updatedItem = await PhoneBook.update(/* query, update, options, dataSource*/);
const updatedItems =  await PhoneBook.updateMany(/* query, update, options, dataSource*/);

await PhoneBook.delete(/* query, options, dataSource*/);
await PhoneBook.deleteMany(/* query, options, dataSource*/);
```

[[Learn more about *Query Language*]](./query-language)

Methods `insert`, `find` and `update` will return Entities, and `insertMany`, `findMany` and `updateMany` will return collections of Entities (for now, collections are just arrays).

### Working with entities

Entities are objects with a status, some data sources related information, and their own methods.

* Status of an entity can be checked using `getStatus()`.  Currently, there are 3 status implemented:
   1. `orphan`: This entity does not exists in any data source. `getLastDataSource()` should return `null` if entity is spawned, or the data source it was deleted from if destroyed.
   1. `syncing`: Entity is performing operations to be synced with your data source. At this point, `getLastDataSource()` will return your data source name.
   1. `sync`: The entity exists in at least one data source.
* You can check your entity status in each data sources it is aware of by inspecting the `dataSources` property. This hash contains the `DataSourceEntity` for each sources. You can also know which data source was lastly used by using `lastDataSource()`
* You can use methods to help you working with your Entities. Custom methods can be added by setting the `methods` hash in the model configuration.

#### Create, retrieve & manage entities

##### Entities

You can get Entities from model methods. Query methods `insert`, `find` and `update` will return an [entity](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity) in a *sync* status. You can also create *orphan* entities with `spawn`.

Entities can be saved to a specific data source with **[persist](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#persist)**([*string* `sourceName`]) ► *Promise*
You can reload your entity from a specific data source by using **[fetch](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#fetch)**([*string* `sourceName`]) ► *Promise*
Lastly, you can decide to remove your entity from your data source with **[destroy](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#destroy)**([*string* `sourceName`]) ► *Promise*

##### Sets

Query methods `insertMany`, `findMany` and `updateMany` return [sets](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FSet). Sets are a convinient way to manage several entities at the same time. You can also spawn a set using `spawnMulti`.

Sets have the same methods than Entities, plus `update`. This method allow you to set provided attributes of all entities from this set.

#### Validation methods

> Mêh... Upcoming.

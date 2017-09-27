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

First, install the package (and add it to your project's *dependencies*)

<div class="tabs tabs-code">
<div class="tab" data-ref="npm">
<h4>With NPM</h4>
{% highlight shell %}
npm install --save diaspora
{% endhighlight %}
</div>

<!--<div class="tab" data-ref="yarn">
<h3>With Yarn</h3>
{% highlight shell %}
#npm install --save diaspora
{% endhighlight %}
</div> -->
</div>

Once installed, simply load it using *Node*'s `require`

{% highlight javascript %}
const Diaspora = require( 'diaspora' );
{% endhighlight %}

### For the browser

Diaspora is built in 2 versions:

#### Standalone

This build contains Diaspora and all of its dependencies, packaged in a single (*big*) script file. You may prefer to use this file if you want to load Diaspora on every page of your site, or if you don't want to worry with loading each dependencies.

> This build export following libraries:
>
>  * `lodash` as `_`
>  * `bluebird` as `Promise`
>  * `check-types` as `c`
>  * `sequential-event` as `SequentialEvent`

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

```javascript
const NAMESPACE = 'myApp';
const inMemoryDataSource = Diaspora.createDataSource( 'in-memory', {} );
Diaspora.registerDataSource( NAMESPACE, 'myDataSource', inMemoryDataSource );
```

<div class="note info">
Note the constant <code>NAMESPACE</code>. Use case & infos about namespacing is detailed on <a href="#">this page</a>.
</div>

### Working with models

Interactions with your data sources is done through **Models**. Models will allow you to manage your complete collection, and retrieve or create *entities*.

#### Create a model

To create a model, use the `declareModel`'s *Diaspora* method.

<div class="note">
<strong><a href="jsdoc/Diaspora.html#.declareModel__anchor">declareModel</a></strong>(<em>String</em> <code class="prettyprint">moduleName</code>, <em>String</em> <code class="prettyprint">name</code>, <em>Object</em> <code class="prettyprint">modelDesc</code>) ► <em><a href="jsdoc/Model.html">Model</a></em>
</div>

Let's create a **model** describing a phone book, with a name, a phone, an email and a numeric index.

```javascript
const PhoneBook = Diaspora.declareModel( NAMESPACE, 'PhoneBook', {
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

`PhoneBook` is now an instance of **[Model](jsdoc/Model.html)**.

#### Using models

<a href="query-language.html" class="btn">Learn more about <b>Query Language</b></a>

### Working with entities

#### Create & manage entities

#### Validation methods
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
<h3>With NPM</h3>
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

```javascript
const Diaspora = require( 'diaspora' );
```

### For the browser

<div class="note warning">
Diaspora is not yet ready to be used in the browser. Come back later
</div>

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
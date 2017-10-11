# Diaspora

***Multi-source ORM for NodeJS & the browser***

## Build status

> Below status reflect the last development commit status. Releases require all tests to pass successfully

Fancy badges:  
[![Build Status](https://travis-ci.org/GerkinDev/Diaspora.svg?branch=master)](https://travis-ci.org/GerkinDev/Diaspora)
[![Dependency Status](https://gemnasium.com/badges/github.com/GerkinDev/Diaspora.svg)](https://gemnasium.com/github.com/GerkinDev/Diaspora)
[![npm](https://img.shields.io/npm/dm/diaspora.svg)](https://npmjs.org/package/diaspora)
[![npm version](https://badge.fury.io/js/diaspora.svg)](https://badge.fury.io/js/diaspora)
[![GitHub commit activity the past year](https://img.shields.io/github/commit-activity/y/GerkinDev/Diaspora.svg)](https://github.com/GerkinDev/Diaspora)
[![license](https://img.shields.io/github/license/GerkinDev/Diaspora.svg)](https://github.com/GerkinDev/Diaspora)    
[![Build Status](https://saucelabs.com/browser-matrix/Gerkin.svg)](https://saucelabs.com/beta/builds/f5a220edee214a9b81d09239a6314e12)

## GitHub repository

Welcome on the GitHub repository of Diaspora. Please visit the [Manual website](https://diaspora.ithoughts.io/), the [Quick Code Review](https://diaspora.ithoughts.io/docco/index.html) or the [API Documentation](https://diaspora.ithoughts.io/jsdoc/index.html)

> ***Important note***: Diaspora is very young and under heavy development. You are totally free to use it or contribute, but be aware that some important features are incomplete or absent:  
 * *Relations*: Not implemented
 * *[Query language](https://diaspora.ithoughts.io/query-language)*: Supported up to Specification level 2 for default adapters
 * *Registering external adapter*: Soon

---

## Available adapters

<table>
	<thead>
		<tr>
			<th>Adapter</th>
			<th>Repository</th>
			<th>Maintainer</th>
			<th>Other infos</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><img width="100" src="https://github.com/GerkinDev/Diaspora/raw/master/media/inMemory.png"/></td>
			<td colspan="2">Built-in</td>
			<td>QL v2</td>
		</tr>
		<tr>
			<td><a href="https://developer.mozilla.org/en-US/docs/Web/API/Storage"><img width="100" src="https://github.com/GerkinDev/Diaspora/raw/master/media/browserStorage.png"/></a></td>
			<td colspan="2">Built-in (browser build only)</td>
			<td>QL v2</td>
		</tr>
	</tbody>
</table>

## Compatibility

Diaspora requires:
* Node >= 6.4.0

## API Overview

Need help getting started? We have a page on how to [get started in 5 minutes](https://diaspora.ithoughts.io/getting-started.html).

Here is a short API overview. For a detailed API documentation, check the [Diaspora API Documentation](https://diaspora.ithoughts.io/jsdoc/index.html)

### Model methods

#### spawn([*object* `props`]) => *Entity*

Create an entity, defining its properties with provided `props`. The returned entity should be persisted later.

#### spawnMany([*object[]* `props`]) => *Set*

See `spawn`.

#### insert([*object* `props`]) => *Promise(Entity)*

Create an entity, defining its properties with provided `props`, and persist it immediately.

#### insertMany([*object[]* `props`]) => *Promise(Set)*

See `insertMany`.

#### find(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Retrieve an entity matching `query`. If `query` isn't an object, it is considered as an ID.

#### findMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Set)*

See `find`

#### delete(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Delete an entity matching `query`. If `query` isn't an object, it is considered as an ID. `options` can contain `allowEmptyQuery`.

#### deleteMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

See `delete`

#### update(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Update a single entity matching `query`with attributes in `newAttrs`. If `query` isn't an object, it is considered as an ID. `options` can contain `allowEmptyQuery`.

#### updateMany(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Set)*

See `update`

### Entity methods

#### destroy([*string* `source`]) => *Promise(this)*

Delete this entity from the specified `source`. Source hash object is set to `undefined`

#### persist([*string* `source`]) => *Promise(this)*

Save current entity to the specified `source`.

#### fetch([*string* `source`]) => *Promise(this)*

Reload entity from specified `source`.

## Planned or unsure Diaspora behaviors/features

> Manual change of properties

*Unsure* > Entity may change status to `desync` ?

> P2P Adapter

*Unsure* > May be interesting... Check for possible problems about data modification, etc etc.

> IndexedDB Adapter (browser)

*Unsure* > IndexedDB technology may be too immature. See [MDN about IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

> Auto-switch to API server/client

*Planned* > Wait for at least Mongo & Localstorage adapters.
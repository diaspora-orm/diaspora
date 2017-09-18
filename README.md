# Diaspora

***Multi-source ORM for NodeJS & the browser***

## Code details

This documentation section is a readable version of the code, for quick review. Please visit the [Manual website](https://diaspora.ithoughts.io/), the [Quick Code Review](https://diaspora.ithoughts.io/docco/index.html) or the [API Documentation](https://diaspora.ithoughts.io/jsdoc/index.html)

> ***Important note***: Diaspora is very young and under heavy development. You are totally free to use it or contribute, but be aware that some important features are incomplete or absent:
>
> * *Relations*: Not implemented
> * *Browser version*: Not ready
> * *Query language*: Only supports equality
> * *Registering external adapter*: Soon

---

## API Overview

Here is a short API overview. For a detailed API documentation, check... The doc that does not exist yet ^^'

### Model methods

#### make/spawn([*object* `props`]) => *Entity*

Create an entity, defining its properties with provided `props`. The returned entity should be persisted later.

#### makeMany/spawnMany([*object[]* `props`]) => *Entity[]*

See `make` or `spawn`.

#### insert([*object* `props`]) => *Promise(Entity)*

Create an entity, defining its properties with provided `props`, and persist it immediately.

#### insertMany([*object[]* `props`]) => *Promise(Entity[])*

See `insertMany`.

#### find(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Retrieve an entity matching `query`. If `query` isn't an object, it is considered as an ID.

#### findMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity[])*

See `find`

#### delete(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Delete an entity matching `query`. If `query` isn't an object, it is considered as an ID. `options` can contain `allowEmptyQuery`.

#### deleteMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

See `delete`

#### update(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Update a single entity matching `query`with attributes in `newAttrs`. If `query` isn't an object, it is considered as an ID. `options` can contain `allowEmptyQuery`.

#### updateMany(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Entity[])*

See `update`

### Entity methods

#### destroy([*string* `source`]) => *Promise(this)*

Delete this entity from the specified `source`. Source hash object is set to `undefined`

#### persist([*string* `source`]) => *Promise(this)*

Save current entity to the specified `source`.

#### fetch([*string* `source`]) => *Promise(this)*

Reload entity from specified `source`.

## Planned or unsure Diaspora behaviors/features

> Manual change of ID

*Unsure* > Entity may change mode to `desync` ?

> P2P Adapter

*Unsure* > May be interesting... Check for possible problems about data modification, etc etc.

> IndexedDB Adapter (browser)

*Unsure* > Technology may be too immature. See [MDN about IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

> Auto-switch to API server/client

*Planned* > Wait for at least Mongo & Localstorage adapters.
# Diaspora

***Multi-source ORM for NodeJS & the browser***

## Code details

This documentation section is a readable version of the code, for quick review. Please visit the [Manual website](http://github.ithoughts.io/Diaspora), the [Quick Code Review](http://github.ithoughts.io/Diaspora/docco/index.html) or the [API Documentation](http://github.ithoughts.io/Diaspora/jsdoc/index.html)

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

## Planned or unsure Diaspora behaviors

> Manual change of ID

*Unsure* > Entity may change mode to `desync` ?

> P2P Adapter

*Unsure* > May be interesting... Check for possible problems about data modification, etc etc.

> Mongo Adapter

*Planned* > Wait for definitive adapter structure

> Redis Adapter

*Planned* > Wait for definitive adapter structure

> LocalStorage/SessionStorage Adapter

*Planned* > Wait for definitive adapter structure

> Auto-switch to API server/client

*Planned* > Wait for at least Mongo & Localstorage adapters.
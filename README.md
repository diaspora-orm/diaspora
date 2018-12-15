# Diaspora

***Multi-source ORM for NodeJS & the browser***

## Build status

Fancy badges:
[![Build Status](https://travis-ci.org/diaspora-orm/diaspora.svg?branch=master)](https://travis-ci.org/diaspora-orm/diaspora)
[![Dependency Status](https://david-dm.org/diaspora-orm/diaspora.svg)](https://david-dm.org/diaspora-orm/diaspora)
[![Maintainability](https://api.codeclimate.com/v1/badges/f549405fb8016f6fdb1b/maintainability)](https://codeclimate.com/github/diaspora-orm/diaspora/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f549405fb8016f6fdb1b/test_coverage)](https://codeclimate.com/github/diaspora-orm/diaspora/test_coverage)
[![npm](https://img.shields.io/npm/dm/@diaspora/diaspora.svg)](https://www.npmjs.com/package/@diaspora/diaspora)
[![npm version](https://badge.fury.io/js/%40diaspora%2Fdiaspora.svg)](https://www.npmjs.com/package/@diaspora/diaspora)
[![GitHub commit activity the past year](https://img.shields.io/github/commit-activity/y/diaspora-orm/diaspora.svg)](https://github.com/diaspora-orm/diaspora)
[![license](https://img.shields.io/github/license/diaspora-orm/diaspora.svg)](https://github.com/diaspora-orm/diaspora/blob/master/LICENSE)
[![Greenkeeper badge](https://badges.greenkeeper.io/diaspora-orm/diaspora.svg)](https://greenkeeper.io/)

## Thanks to

### Browserstack

[<img src="https://cdn.rawgit.com/diaspora-orm/diaspora/master/media/Browserstack.svg" height="105.6" width="490.1"/>](https://www.browserstack.com/)

for integration tests.

## Installation

To install Diaspora, simply run one of the following commands:

```bash
# With NPM
npm install --save @diaspora/diaspora
# With Yarn
yarn add @diaspora/diaspora
```

## Documentation & important notes

Welcome on the GitHub repository of Diaspora. Please visit the [manual website](https://diaspora.ithoughts.io/), where you can find [guides](https://diaspora.ithoughts.io/guides/), [tutorials](https://diaspora.ithoughts.io/tutorials/), or the [API tocumentation](https://diaspora.ithoughts.io/api)

> ***Important note***: Diaspora is very young and under heavy development. You
are totally free to use it or contribute, but be aware that some important
features are incomplete or absent:
 * *Relations*: Not implemented
 * *[Query language](https://diaspora.ithoughts.io/guides/query-language)*: Supported up to Specification level 2.
 * *Multi sources*: not tested

## Diaspora extensions

### Available adapters

<table style="display:table;">
    <thead>
        <tr>
            <th rowspan="2">Adapter</th>
            <th rowspan="2">Description</th>
            <th rowspan="2">Links</th>
            <th rowspan="2">Maintainer</th>
            <th colspan="2">Platform</th>
            <th rowspan="2">Other infos</th>
        </tr>
        <tr>
            <th>Node</th>
            <th>Browser</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="vertical-align: middle;">
                <img width="100" alt="In memory" src="https://cdn.rawgit.com/diaspora-orm/diaspora/master/media/inMemory.svg"/><br/>
                In Memory
            </td>
            <td>A simple adapter that stores its data directly in the memory</td>
            <td colspan="2" rowspan="3" style="vertical-align: middle;">Built-in</td>
            <td>✓</td>
            <td>✓</td>
            <td rowspan="3" style="vertical-align: middle;">[QL] v2</td>
        </tr>
        <tr>
            <td style="vertical-align: middle;">
                <img width="100" alt="Web API" src="https://cdn.rawgit.com/diaspora-orm/diaspora/master/media/webApi.svg"/><br/>
                WebApi
            </td>
            <td>A customizable adapter that use HTTP APIs as data source. Convinient to query easily REST, SOAP or GraphQL apis.</td>
            <td>✓</td>
            <td>✓</td>
        </tr>
        <tr>
            <td style="vertical-align: middle;"><a href="https://developer.mozilla.org/en-US/docs/Web/API/Storage">
                <img width="100" alt="Browser storage" src="https://cdn.rawgit.com/diaspora-orm/diaspora/master/media/webStorage.svg"/><br/>
                WebStorage</a>
            </td>
            <td>A simple adapter that stores its data in the browser's local or session storage.</td>
            <td>✗</td>
            <td>✓</td>
        </tr>
        <tr>
            <td style="vertical-align: middle;"><a href="https://www.mongodb.com/">
                <img width="100" alt="MongoDB" src="https://cdn.rawgit.com/diaspora-orm/adapter-mongo/master/media/mongo.svg"/><br/>
                MongoDB</a>
            </td>
            <td></td>
            <td style="vertical-align: middle;">
                <a href="https://github.com/diaspora-orm/adapter-mongo" target="_blank"><img alt="GitHub release" src="https://img.shields.io/github/release/diaspora-orm/adapter-mongo.svg?label=GitHub"/></a><br/>
                <a href="https://www.npmjs.com/package/@diaspora/adapter-mongo" target="_blank"><img alt="npm" src="https://img.shields.io/npm/v/@diaspora/adapter-mongo.svg"/></a><br/>
                <a href="https://yarnpkg.com/en/package/@diaspora/adapter-mongo" target="_blank"><img alt="yarn" src="https://img.shields.io/npm/v/@diaspora/adapter-mongo.svg?label=yarn"/></a>
            </td>
            <td style="vertical-align: middle;"><a href="https://github.com/diaspora-orm" target="_blank"><img alt="GitHub followers" src="https://img.shields.io/github/followers/diaspora-orm.svg?label=Diaspora%20ORM"/></a></td>
            <td>✓</td>
            <td>✗</td>
            <td style="vertical-align: middle;">[QL] v2</td>
        </tr>
        <tr>
            <td style="vertical-align: middle;"><a href="https://redis.io/">
                <img width="100" alt="Redis" src="https://cdn.rawgit.com/diaspora-orm/adapter-redis/master/media/redis.svg"/><br/>
                Redis</a>
            </td>
            <td></td>
            <td style="vertical-align: middle;">
                <a href="https://github.com/diaspora-orm/adapter-redis" target="_blank"><img alt="GitHub release" src="https://img.shields.io/github/release/diaspora-orm/adapter-redis.svg?label=GitHub"/></a><br/>
                <a href="https://www.npmjs.com/package/@diaspora/adapter-redis" target="_blank"><img alt="npm" src="https://img.shields.io/npm/v/@diaspora/adapter-redis.svg"/></a><br/>
                <a href="https://yarnpkg.com/en/package/@diaspora/adapter-redis" target="_blank"><img alt="yarn" src="https://img.shields.io/npm/v/@diaspora/adapter-redis.svg?label=yarn"/></a>
            </td>
            <td style="vertical-align: middle;"><a href="https://github.com/diaspora-orm" target="_blank"><img alt="GitHub followers" src="https://img.shields.io/github/followers/diaspora-orm.svg?label=Diaspora%20ORM"/></a></td>
            <td>✓</td>
            <td>✗</td>
            <td style="vertical-align: middle;">[QL] v2</td>
        </tr>
    </tbody>
</table>

### Other modules

[plugin-server](https://www.npmjs.com/package/@diaspora/plugin-server): a package to easily create APIs for Diaspora models

## Compatibility

Diaspora requires:

* Node `>=` 6.4.0
* Browsers:
  * Edge `>=` 12
  * Firefox `>=` 18
  * Chrome `>=` 49
  * Safari & iOS Safari `>=`10
  * Chrome for Android `>=` 61
  * Samsung Internet `>=` 5

More briefly, Diaspora runs on all browsers & JavaScript engines that supports
[Proxies](http://caniuse.com/#feat=proxy).

Notable incompatible browsers are

* Internet Explorer (all versions)
* Opera Mini
* UC Browser for Android

## API Overview

Need help getting started? We have a page on how to [get started in 5 minutes](https://diaspora.ithoughts.io/guides/getting-started).

Here is a short API overview. For a detailed API documentation, check the [Diaspora API Documentation](https://diaspora.ithoughts.io/api)

### Model methods

#### spawn([*object* `props`]) => *Entity*

Create an entity, defining its properties with provided `props`. The returned
entity should be persisted later.

#### spawnMany([*object[]* `props`]) => *Set*

See `spawn`.

#### insert([*object* `props`]) => *Promise(Entity)*

Create an entity, defining its properties with provided `props`, and persist it
immediately.

#### insertMany([*object[]* `props`]) => *Promise(Set)*

See `insertMany`.

#### find(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Retrieve an entity matching `query`. If `query` isn't an object, it is
considered as an ID.

#### findMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Set)*

See `find`

#### delete(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Delete an entity matching `query`. If `query` isn't an object, it is considered
as an ID. `options` can contain `allowEmptyQuery`.

#### deleteMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

See `delete`

#### update(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Entity)*

Update a single entity matching `query`with attributes in `newAttrs`. If `query`
isn't an object, it is considered as an ID. `options` can contain
`allowEmptyQuery`.

#### updateMany(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Set)*

See `update`

### Entity/Set methods

#### destroy([*string* `source`]) => *Promise(this)*

Delete this entity from the specified `source`. Source hash object is set to
`undefined`

#### persist([*string* `source`]) => *Promise(this)*

Save current entity to the specified `source`.

#### fetch([*string* `source`]) => *Promise(this)*

Reload entity from specified `source`.

## Planned or unsure Diaspora behaviors/features

> Manual change of properties

*Unsure* > Entity may change status to `desync` ?

> P2P Adapter

*Unsure* > May be interesting... Check for possible problems about data
modification, etc etc.

> IndexedDB Adapter (browser)

*Unsure* > IndexedDB technology may be too immature. See [MDN about IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).
*Note: Plan to show fallback implementations*

[QL]: https://diaspora.ithoughts.io/guides/query-language#match-queries

## Working with the development version

If you are having issues, or you want to participate to the development and create new features, you may have to use the `develop`ment or `staging` version of Diaspora. Here is how you can do that: 

```sh
# Clone the repository & go into it
git clone https://github.com/diaspora-orm/diaspora.git && cd diaspora
# Go on the staging branch (you can also use directly the `develop` branch, but it may be less stable)
git checkout staging
# The following command installs dependencies & compiles the package
npm run build
# Finally, expose your local build so that it can be used in other projects.
# You may need to run it with `sudo`.
npm link

# Go to your project
cd ~/myproject
# Ensure deps are installed
npm install
# And link the local version
npm link @diaspora/diaspora
```

> Note that you may need to re-run `npm link @diaspora/diaspora` after every install (`npm install`) in your project.

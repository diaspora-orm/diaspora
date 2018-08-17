# [0.3.0-alpha.13](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.12...v0.3.0-alpha.13) (2018-08-17)


### Bug Fixes

* **Adapters.Base.Adapter:** Options fields authorize `undefined` values. ([1fc50f6](https://github.com/diaspora-orm/diaspora/commit/1fc50f6))
* **EntityTransformer.Default:** Fixed deep defaulting on objects & arrays ([fe71e30](https://github.com/diaspora-orm/diaspora/commit/fe71e30))
* **Logger.NodeLogger:** Use any to discard wrong TS acceptance for symbols as keys ([a84519b](https://github.com/diaspora-orm/diaspora/commit/a84519b))
* **Model:** Normalize `attributes` & `of` fields for object & array descriptions ([fe2fe1e](https://github.com/diaspora-orm/diaspora/commit/fe2fe1e))


### Performance Improvements

* **Adapters.InMemory.Adapter:** Added insertMany, added several find iterators ([3c23e09](https://github.com/diaspora-orm/diaspora/commit/3c23e09))



<a name="0.3.0-alpha.12"></a>
# [0.3.0-alpha.12](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.11...v0.3.0-alpha.12) (2018-07-29)


### Bug Fixes

* **Adapters.DataAccessLayer:** Cast partially query itself ([465a2d2](https://github.com/diaspora-orm/diaspora/commit/465a2d2))
* **Adapters.WebApiAdapter.Adapter:** Better error handling ([5e64ddd](https://github.com/diaspora-orm/diaspora/commit/5e64ddd))
* **Adapters.WebStorageAdapter.Adapter:** Better config & errors testing ([4f84599](https://github.com/diaspora-orm/diaspora/commit/4f84599))



<a name="0.3.0-alpha.11"></a>
# [0.3.0-alpha.11](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.10...v0.3.0-alpha.11) (2018-07-26)


### Bug Fixes

* **browser|node:** Fixed target specific code with rollup-jscc ([14a4652](https://github.com/diaspora-orm/diaspora/commit/14a4652))
* **Entity.Entity:** Use same retrieved/generated ID for IDHash & ID update ([a3bc61e](https://github.com/diaspora-orm/diaspora/commit/a3bc61e))



<a name="0.3.0-alpha.10"></a>
# [0.3.0-alpha.10](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.9...v0.3.0-alpha.10) (2018-07-19)


### Bug Fixes

* **Adapter/AdapterUtils:** Fixed circular dependency ([3e98057](https://github.com/diaspora-orm/diaspora/commit/3e98057))


### Features

* **Entity,AdapterEntity:** Added the notion of `properties` and `attributes` ([1373fae](https://github.com/diaspora-orm/diaspora/commit/1373fae))
* **Set:** `toChainable()` now takes an optional transformation mode & source ([96aaa2e](https://github.com/diaspora-orm/diaspora/commit/96aaa2e))



<a name="0.3.0-alpha.9"></a>
# [0.3.0-alpha.9](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.8...v0.3.0-alpha.9) (2018-07-02)


### Reverts

* **EntityTransformer/DefaultTransformer:** Default model functions can't be async anymore ([2a453c3](https://github.com/diaspora-orm/diaspora/commit/2a453c3))



<a name="0.3.0-alpha.8"></a>
# [0.3.0-alpha.8](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.7...v0.3.0-alpha.8) (2018-07-02)


### Bug Fixes

* **Adapters/WebApi/Node:** Fixed stringification condition for object only ([8f64b8e](https://github.com/diaspora-orm/diaspora/commit/8f64b8e))
* **Entity:** Added handling of rejection on entity defaulting ([f3f2a21](https://github.com/diaspora-orm/diaspora/commit/f3f2a21))
* **WebApiAdapter:** catch undefined JSON response ([45a9265](https://github.com/diaspora-orm/diaspora/commit/45a9265))



<a name="0.3.0-alpha.7"></a>
# [0.3.0-alpha.7](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.6...v0.3.0-alpha.7) (2018-05-20)



<a name="0.3.0-alpha.6"></a>
# [0.3.0-alpha.6](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.5...v0.3.0-alpha.6) (2018-05-20)



<a name="0.3.0-alpha.5"></a>
# [0.3.0-alpha.5](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.4...v0.3.0-alpha.5) (2018-05-19)


### Bug Fixes

* **ExtendableError:** class is now abstract & must be subclassed ([643b03a](https://github.com/diaspora-orm/diaspora/commit/643b03a))
* **Model:** Fixed `Model.delete` that used `DataAccessLayer.deleteMany` ([87ea3d6](https://github.com/diaspora-orm/diaspora/commit/87ea3d6))
* **src/*:** Fixed exports types + values, removed default export, changed Diaspora type to DiasporaStatic ([9165f18](https://github.com/diaspora-orm/diaspora/commit/9165f18))
* **WebStorageAdapter:** using `global` instead of `window` ([3a4e984](https://github.com/diaspora-orm/diaspora/commit/3a4e984))



<a name="0.3.0-alpha.4"></a>
# [0.3.0-alpha.4](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.3...v0.3.0-alpha.4) (2018-04-17)


### Bug Fixes

* **Diaspora:** Diaspora assign new models to its private hash, not public copy via getter ([86fc83c](https://github.com/diaspora-orm/diaspora/commit/86fc83c))
* **Entities/EntityFactory:** Fixed Entity.getDiff ([c7fc230](https://github.com/diaspora-orm/diaspora/commit/c7fc230))
* **Errors/*:** Errors have the proper name (retrieved from `new.target.name`) ([7facce3](https://github.com/diaspora-orm/diaspora/commit/7facce3))


### Features

* **Entities/EntityFactory:** Entity methods allow more types for dataSource parameter ([ab0ad68](https://github.com/diaspora-orm/diaspora/commit/ab0ad68))
* **Model:** Model singular actions now accepts either a SelectQueryOrCondition or an EntityUid ([bc34176](https://github.com/diaspora-orm/diaspora/commit/bc34176))



<a name="0.3.0-alpha.3"></a>
# [0.3.0-alpha.3](https://github.com/diaspora-orm/diaspora/compare/v0.3.0-alpha.1...v0.3.0-alpha.3) (2018-04-08)


### Bug Fixes

* **src/entities/entityFactory:** Entity has default parameter for `getId`, and new getter for `id` ([60c40b5](https://github.com/diaspora-orm/diaspora/commit/60c40b5))


### Features

* **src/diaspora:** Exposed getter for `models` hash ([f1afbd6](https://github.com/diaspora-orm/diaspora/commit/f1afbd6))



<a name="0.3.0-alpha.1"></a>
# [0.3.0-alpha.1](https://github.com/diaspora-orm/diaspora/compare/v0.2.0...v0.3.0-alpha.1) (2018-04-07)


### Bug Fixes

* **dependencies:** Fixed require of sequential-event ([de4db02](https://github.com/diaspora-orm/diaspora/commit/de4db02))
* **src/{diaspora,utils}:** Fixed path to entity-related classes ([48c2324](https://github.com/diaspora-orm/diaspora/commit/48c2324))
* **src/{validator,model}:** Fixed validator prop wrong filter, use type guards for FieldDescriptor v ([82ed057](https://github.com/diaspora-orm/diaspora/commit/82ed057))
* **src/*:** Changed lodash import method, resolved circular dependency ([60a9424](https://github.com/diaspora-orm/diaspora/commit/60a9424))
* **src/*:** Fixed query types ([2bf84f9](https://github.com/diaspora-orm/diaspora/commit/2bf84f9))
* **src/adapter/base/adapter:** Fixed adapter ctor interface inheritance ([34f8bf3](https://github.com/diaspora-orm/diaspora/commit/34f8bf3))
* **src/entities/entityFactory:** `maybeEmit` bound to current Entity when preparing multi lifecycle ([999edbe](https://github.com/diaspora-orm/diaspora/commit/999edbe))
* **src/entity/*:** Fixed entity create, attributes passed to event handlers, sourceName in Set actio ([6971dfd](https://github.com/diaspora-orm/diaspora/commit/6971dfd))
* **src/errors/ExtendableError:** Fixed constructor inheritance ([5344be2](https://github.com/diaspora-orm/diaspora/commit/5344be2))


### Features

* **adapters/*:** Rewrite adapters ([8b27ab4](https://github.com/diaspora-orm/diaspora/commit/8b27ab4))
* **Adapters/webApi/Adapter:** WebApi adapter loads events from event providers for init ([0f099ee](https://github.com/diaspora-orm/diaspora/commit/0f099ee))
* **Diaspora:** Better logger ([9149c47](https://github.com/diaspora-orm/diaspora/commit/9149c47))
* **Model:** Added modelDescription to model instance ([f5550f7](https://github.com/diaspora-orm/diaspora/commit/f5550f7))
* **src/{model,diaspora,adapters/dataAccessLayer}:** Added DataAccessLayer ([2265392](https://github.com/diaspora-orm/diaspora/commit/2265392)), closes [#4](https://github.com/diaspora-orm/diaspora/issues/4)
* **src/adapters/*:** Added decorators for autoId & self-matching adapter entities ([e1b5ef6](https://github.com/diaspora-orm/diaspora/commit/e1b5ef6))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/diaspora-orm/diaspora/compare/v0.1.0...v0.2.0) (2017-23-12, Merry Christmas)

### Features

* Added class Set to manage several entities at the same time
* Added webApi adapter
* Added lifecycle events (see the [documentation](https://diaspora.ithoughts.io/events-in-diaspora.html#lifecycle-events))
* Added Winston instance exposed as [`Diaspora.logger`](https://diaspora.ithoughts.io/jsdoc/Diaspora.html#.logger__anchor)
* Added more custom errors
* Added [`Diaspora.registerAdapter`](https://diaspora.ithoughts.io/jsdoc/Diaspora.html#.registerAdapter__anchor) to register external adapters
* Added entity & set validation before persisting
* Auto-retrieve Diaspora from Node `require`'s cache

### Updates

* Upgraded to sequential-event ^0.3.1
* Upgraded bluebird to ^3.5.1
* Upgraded Babel components (core, preset-env, polyfill, loader) to 7.0.0 beta.35 in @babel
* Reviewed deploy pipelines
* Dropped support of Node < 7.0.0
* `browserStorage` adapter renamed to `webStorage`
* Improved maintainability
* Custom errors now extend base JavaScript errors


<a name="0.1.0"></a>
# [0.1.0](https://github.com/diaspora-orm/diaspora/compare/v0.1.0...init) (2017-03-10)


* Initial release

# Diaspora changelog

## v0.2.0 (12/23/2017, Merry Christmas)

### New features

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

---

## v0.1.0 (10/03/2017)

* Initial release

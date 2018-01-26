'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { _, Promise, } = require('../../dependencies');
const { Diaspora } = require('../../diaspora');
const DiasporaAdapter = Diaspora.components.Adapters.Adapter;
const WebApiEntity = require('./entity.js');
const queryObjectToString = queryObject => {
    return _(queryObject).chain(_.cloneDeep).omitBy(val => _.isObject(val) && _.isEmpty(val))
        .mapValues(JSON.stringify)
        .toPairs()
        .map(_.partial(_.map, _, encodeURIComponent))
        .map(arr => `${arr[0]}=${arr[1]}`)
        .join('&').value();
};
const getMessage = xhr => _.get(xhr, 'response.message') ? `"${xhr.response.message}"` : 'NULL';
const httpErrorFactories = {
    400: xhr => new Error(`Posted data through HTTP is invalid; message ${getMessage(xhr)}`),
    404: xhr => new Error(`Reached 404, message is ${getMessage(xhr)}`),
    _: xhr => new Error(`Unhandled HTTP error with status code ${xhr.status} & message ${getMessage(xhr)}`),
};
const defineXhrEvents = (xhr, resolve, reject) => {
    xhr.onload = () => {
        if (_.inRange(xhr.status, 200, 299)) {
            return resolve(xhr.response);
        }
        else {
            return reject(_.get(httpErrorFactories, xhr.status, httpErrorFactories._)(xhr));
        }
    };
    xhr.onerror = () => {
        return reject(httpErrorFactories._(xhr));
    };
};
const httpRequest = (method, endPoint, data, queryObject) => __awaiter(this, void 0, void 0, function* () {
    if (!process.browser) {
        if (_.isNil(data)) {
            data = true;
        }
        return yield require('request-promise')[method.toLowerCase()](endPoint, {
            json: data,
            qs: _.mapValues(queryObject, JSON.stringify),
        });
    }
    else {
        return new Promise((resolve, reject) => {
            /* globals XMLHttpRequest: false */
            const xhr = new XMLHttpRequest();
            defineXhrEvents(xhr, resolve, reject);
            const queryString = queryObjectToString(queryObject);
            xhr.responseType = 'json';
            xhr.open(method, `${endPoint}${queryString ? `?${queryString}` : ''}`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(_.isNil(data) ? undefined : JSON.stringify(data));
        });
    }
});
const getQueryObject = (queryFind, options) => {
    if (0 === options.skip) {
        delete options.skip;
    }
    return _.assign({}, _.omit(options, ['remapInput', 'remapOutput']), { where: queryFind });
};
const maybeAddIdHashToEntities = (entities, adapter) => {
    if (!_.isEmpty(entities)) {
        entities = _.map(entities, _.unary(adapter.setIdHash.bind(adapter)));
    }
    return entities;
};
const checkWebApiAdapterConfig = config => {
    if (!process.browser && !_.isString(config.host)) {
        throw new Error(`"config.host" is not defined, or is not a string: had "${config.host}"`);
    }
    if (!process.browser && !_.isString(config.scheme)) {
        throw new Error(`"config.scheme" is not defined, or is not a string: had "${config.scheme}"`);
    }
};
/**
 * Adapter for RESTful HTTP APIs.
 *
 * @see https://www.npmjs.com/package/diaspora-server Diaspora-Server: Package built on Diaspora & Express.js to easily configure HTTP APIs compatible with this adapter.
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class WebApiDiasporaAdapter extends DiasporaAdapter {
    /**
     * Create a new instance of web api adapter.
     *
     * @param {Object}         [config]                 - Configuration of this adapter.
     * @param {string|false}   [config.scheme = false]  - Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
     * @param {string|false}   [config.host = false]    - Hostname of the endpoint. On server environment, this parameter is *required*.
     * @param {number|false}   [config.port = false]    - Port of the endpoint.
     * @param {number|false}   [config.path = '']       - Path to the endpoint.
     * @param {Object<string>} [config.pluralApis = {}] - Hash with keys being the singular name of the endpoint, and values being the associated plural name of the same endpoint.
     * @author gerkin
     */
    constructor(config = {}) {
        /**
         * Link to the WebApiEntity.
         *
         * @name classEntity
         * @type {DataStoreEntities.WebApiEntity}
         * @memberof Adapters.WebApiDiasporaAdapter
         * @instance
         * @author Gerkin
         */
        super(WebApiEntity);
        /**
         * Base URL to the REST API
         *
         * @name baseEndPoint
         * @type {string}
         * @author Gerkin
         */
        _.defaults(config, {
            scheme: false,
            host: false,
            port: false,
            path: '',
            pluralApis: {},
        });
        checkWebApiAdapterConfig(config);
        if (process.browser && false === config.host) {
            // Endpoint is an absolute url
            this.baseEndPoint = config.path;
        }
        else {
            const portString = config.port ? `:${config.port}` : '';
            const schemeString = config.scheme ? `${config.scheme}:` : '';
            this.baseEndPoint = `${schemeString}//${config.host}${portString}${config.path}`;
        }
        this.state = 'ready';
        /**
         * Hash mapping singular API names to plural API names
         *
         * @name pluralApis
         * @type {Object<string>}
         * @author Gerkin
         */
        this.pluralApis = config.pluralApis;
    }
    /**
     * Send an http query to the targeted `endPoint` using `method` as verb.
     *
     * @async
     * @param   {string} verb          - Valid HTTP verb. This adapter uses `GET`, `POST`, `PATCH` & `DELETE`.
     * @param   {string} endPoint      - Name of the endpoint to interact with. It will be prepended with {@link Adapters.WebApiDiasporaAdapter#baseEndPoint}.
     * @param   {Object} [data]        - Optionnal data to send within the body of the request.
     * @param   {Object} [queryObject] - Optionnal query object to send along with the request.
     * @returns {Promise<Object>} Promise resolved with the resulting data.
     */
    httpQuery(verb, endPoint, data, queryObject) {
        return httpRequest(verb, `${this.baseEndPoint}/${endPoint.toLowerCase()}`, data, queryObject);
    }
    /**
     * Get the plural name of an endpoint.
     *
     * @param   {string} endPoint - Name of the endpoint.
     * @returns {string} Plural version of the endpoint name.
     */
    getPluralEndpoint(endPoint) {
        if (this.pluralApis.hasOwnProperty(endPoint)) {
            return this.pluralApis[endPoint];
        }
        else {
            return `${endPoint}s`;
        }
    }
    // -----
    // ### Insert
    /**
     * Insert a single entity through an HTTP API.
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for use of web api.
     * @author gerkin
     * @param   {string} table  - Name of the table to insert data in.
     * @param   {Object} entity - Hash representing the entity to insert.
     * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity}* `entity`).
     */
    insertOne(table, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            entity = yield this.httpQuery('POST', table, entity);
            if (!_.isNil(entity)) {
                this.setIdHash(entity);
            }
            return this.maybeCastEntity(entity);
        });
    }
    /**
     * Insert several entities through an HTTP API.
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}   table    - Name of the table to insert data in.
     * @param   {Object[]} entities - Hash representing entities to insert.
     * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity[]}* `entities`).
     */
    insertMany(table, entities) {
        return __awaiter(this, void 0, void 0, function* () {
            entities = yield this.httpQuery('POST', this.getPluralEndpoint(table), entities);
            entities = maybeAddIdHashToEntities(entities, this);
            return this.maybeCastSet(entities);
        });
    }
    // -----
    // ### Find
    /**
     *
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to retrieve data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
     */
    findOne(table, queryFind, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let entity = yield this.httpQuery('GET', table, null, getQueryObject(queryFind, options));
            if (!_.isNil(entity)) {
                this.setIdHash(entity);
            }
            return this.maybeCastEntity(entity);
        });
    }
    /**
     *
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to retrieve data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
     */
    findMany(table, queryFind, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let entities = yield this.httpQuery('GET', this.getPluralEndpoint(table), null, getQueryObject(queryFind, options));
            entities = maybeAddIdHashToEntities(entities, this);
            return this.maybeCastSet(entities);
        });
    }
    // -----
    // ### Update
    /**
     *
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to update data in.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
     * @param   {Object}                               update       - Object properties to set.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
     */
    updateOne(table, queryFind, update, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let entity = yield this.httpQuery('PATCH', table, update, getQueryObject(queryFind, options));
            if (!_.isNil(entity)) {
                entity.idHash = {
                    [this.name]: entity.id,
                };
            }
            return this.maybeCastEntity(entity);
        });
    }
    /**
     *
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to update data in.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
     * @param   {Object}                               update       - Object properties to set.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
     */
    updateMany(table, queryFind, update, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let entities = yield this.httpQuery('PATCH', this.getPluralEndpoint(table), update, getQueryObject(queryFind, options));
            entities = maybeAddIdHashToEntities(entities, this);
            return this.maybeCastSet(entities);
        });
    }
    // -----
    // ### Delete
    /**
     *
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to delete data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
     */
    deleteOne(table, queryFind, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.httpQuery('DELETE', table, null, getQueryObject(queryFind, options));
        });
    }
    /**
     *
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to delete data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
     */
    deleteMany(table, queryFind, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.httpQuery('DELETE', this.getPluralEndpoint(table), null, getQueryObject(queryFind, options));
        });
    }
}
module.exports = WebApiDiasporaAdapter;
//# sourceMappingURL=adapter.js.map
'use strict';

/* globals Diaspora: false */

const adapter = new Diaspora.components.Adapters.Adapter();
const AdapterTestUtils = require( './utils' );

AdapterTestUtils.checkInputFiltering( adapter );

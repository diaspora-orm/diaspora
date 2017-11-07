'use strict';

const adapter = new Diaspora.components.Adapters.Adapter();
const AdapterTestUtils = require( './utils' );

AdapterTestUtils.checkInputFiltering( adapter );

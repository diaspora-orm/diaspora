# Changelog

## v0.2.0 ()

* Upgraded to sequential-event ^0.1.1
* Added class Set to manage several entities at the same time
* Added lifecycle events:
	* beforeUpdate => persist => afterUpdate
	* beforeFind => fetch => afterFind
	* beforeDelete => destroy => afterDelete

## v0.1.0 (10/03/2017)

Initial release
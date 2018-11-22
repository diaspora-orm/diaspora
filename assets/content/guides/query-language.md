# Query language

## Match queries

Match queries are used when you use `find`, `update` or `delete` operations.

<div markdown class="note info">
If you put several operators in a condition object, they'll be combined using an `AND` operator.
</div>

<div markdown class="note info">
Numbers in parenthesis in operations' name indicates the Query Language Specification Level. Check your adapters' documentation to see the level supported by adapters you use.
</div>

### Match all <sup>(1)</sup>

<div markdown class="tabs tabs-code">
<div markdown class="tab" data-ref="diaspora">

#### Diaspora

```ts
PhoneBook.findMany({}).then(...);
```
</div>
<div markdown class="tab" data-ref="sql">

#### SQL

```sql
SELECT * FROM `PhoneBook`;
```
</div>
<div markdown class="tab" data-ref="mongodb">

#### MongoDB

```ts
db.getCollection( 'PhoneBook' ).find({}).then(...);
```
</div>
</div>

### Match by field value <sup>(1)</sup>

<div markdown class="tabs tabs-code">
<div markdown class="tab" data-ref="diaspora">

#### Diaspora

```ts
PhoneBook.find({ id: '9ff2c6d2-9b90-43b8-b6b6-d8767966a3e6' }).then(...); // Match a single entity that have this value
PhoneBook.findMany({ phone: undefined }).then(...); // Match all entities that does not have a `phone`
```
</div>
<div markdown class="tab" data-ref="sql">

#### SQL

```sql
SELECT * FROM `PhoneBook` WHERE `id`=15;
SELECT * FROM `PhoneBook` WHERE `phone` IS NULL;
```
</div>
<div markdown class="tab" data-ref="mongodb">

#### MongoDB

```ts
db.getCollection( 'PhoneBook' ).find({ _id: ObjectId("59bf7e38945e5adadfd83b1c") }).then(...);
db.getCollection( 'PhoneBook' ).find({ phone: { $exists: false } }).then(...);
```
</div>
</div>

### Match by a value defined or not, with **~** <sup>(2)</sup>

<div markdown class="tabs tabs-code">
<div markdown class="tab" data-ref="diaspora">

#### Diaspora

```ts
PhoneBook.find({ email: { '~': true } }).then(...);
PhoneBook.find({ email: { '~': false } }).then(...);
```
</div>
<div markdown class="tab" data-ref="sql">

#### SQL

```sql
SELECT * FROM `PhoneBook` WHERE `email` IS NULL;
SELECT * FROM `PhoneBook` WHERE `email` IS NOT NULL;
```
</div>
<div markdown class="tab" data-ref="mongodb">

#### MongoDB

```ts
db.getCollection( 'PhoneBook' ).find({ number : { $exists: true } }).then(...);
db.getCollection( 'PhoneBook' ).find({ number : { $exists: false } }).then(...);
```
</div>
</div>

 * `~` can be replaced by `$exists`

### Match by a value equal or not, with **==** and **!=** <sup>(2)</sup>

<div markdown class="tabs tabs-code">
<div markdown class="tab" data-ref="diaspora">

#### Diaspora

```ts
PhoneBook.find({ number: { '==': '(251) 546-9442' } }).then(...);
PhoneBook.find({ number: { '!=': '(251) 546-9442' } }).then(...);
```
The usage of `==` is optional, you can replace `{'==': value}` with `value`
</div>
<div markdown class="tab" data-ref="sql">

#### SQL

```sql
SELECT * FROM `PhoneBook` WHERE `number` = "(251) 546-9442";
SELECT * FROM `PhoneBook` WHERE `number` != "(251) 546-9442";
```
</div>
<div markdown class="tab" data-ref="mongodb">

#### MongoDB

```ts
db.getCollection( 'PhoneBook' ).find({ number : '(251) 546-9442' }).then(...);
db.getCollection( 'PhoneBook' ).find({ number : { $ne: '(251) 546-9442' } }).then(...);
```
</div>
</div>

* `==` can be replaced by `$equal`
* `!=` can be replaced by `$diff`

<div markdown class="note info">
`!=` will match only if entity's value is *defined* **and** *different*.
</div>

### Match by number comparaison, with **<**, **<=**, **>** and **>=** <sup>(2)</sup>

<div markdown class="tabs tabs-code">
<div markdown class="tab" data-ref="diaspora">

#### Diaspora

```ts
PhoneBook.find({ index: { '>': 12 } }).then(...);
PhoneBook.find({ index: { '>=': 12 } }).then(...);
PhoneBook.find({ index: { '<': 12 } }).then(...);
PhoneBook.find({ index: { '<=': 12 } }).then(...);
```

>**Tip:** You should read comparaison operators like this:
>`"Index is greater that 12"`

</div>
<div markdown class="tab" data-ref="sql">

#### SQL

```sql
SELECT * FROM `PhoneBook` WHERE `index` > 12;
SELECT * FROM `PhoneBook` WHERE `index` >= 12;
SELECT * FROM `PhoneBook` WHERE `index` < 12;
SELECT * FROM `PhoneBook` WHERE `index` <= 12;
```
</div>
<div markdown class="tab" data-ref="mongodb">

#### MongoDB

```ts
db.getCollection( 'PhoneBook' ).find({ index: { $gt: 12 } }).then(...);
db.getCollection( 'PhoneBook' ).find({ index: { $gte: 12 } }).then(...);
db.getCollection( 'PhoneBook' ).find({ index: { $lt: 12 } }).then(...);
db.getCollection( 'PhoneBook' ).find({ index: { $lte: 12 } }).then(...);
```
</div>
</div>

* `<` can be replaced by `$less`
* `<=` can be replaced by `$lessEqual`
* `>` can be replaced by `$greater`
* `>=` can be replaced by `$greaterEqual`
 
### Do logical operations, with **||**, **&&**, **\^\^** and **!** <sup>(3)</sup>

<div markdown class="tabs tabs-code">
<div markdown class="tab" data-ref="diaspora">

#### Diaspora

```ts
PhoneBook.find({ index: { '||': [
	{ '<': 5 },
	{ '==': 9 },
] } }).then(...); // Will retrieve items with index [0, 1, 2, 3, 4, 9]
PhoneBook.find({ index: { '&&': [
	{ '<': 10 },
	{ '>=': 5 },
] } }).then(...); // Will retrieve items with index [5, 6, 7, 8, 9]
PhoneBook.find({ index: { '^^': [
	{ email: 'foobar@example.com' },
	{ phone: '(251) 546-9442' },
] } }).then(...); // Will retrieve items with either the provided email or address, but not both
PhoneBook.find({ index: { '!': { '==': 5 } } }).then(...);
```
</div>
<div markdown class="tab" data-ref="sql">

#### SQL

```sql
SELECT * FROM `PhoneBook` WHERE 
	(`index` < 5) OR
	(`index` = 9);
	
SELECT * FROM `PhoneBook` WHERE
	(`index` < 10) AND
	(`index` >= 10);
	
SELECT * FROM `PhoneBook` WHERE
	(`email` = "foobar@example.com") XOR
	(`phone` = "(251) 546-9442");
	
SELECT * FROM `PhoneBook` WHERE NOT (`index` == 5);
```
</div>
<div markdown class="tab" data-ref="mongodb">

#### MongoDB

```ts
db.getCollection( 'PhoneBook' ).find({ $or: [
    { index: { $lt: 5 } },
    { index: { $eq: 9 } },
 ] }).then(...);
 db.getCollection( 'PhoneBook' ).find({ $and: [
    { index: { $lt: 10 } },
    { index: { $gte: 5 } },
 ] })
 db.getCollection( 'PhoneBook' ).find({ $xor: [
	{ email: { $eq: 'foobar@example.com' } },
	{ phone: { $eq: '(251) 546-9442' } },
 ] })
db.getCollection( 'PhoneBook' ).find({ index: { $ne: 5 } }).then(...);
```
<div markdown class="note warning">
Last query is not exactly the same though... **TODO Improve**
</div>
</div>
</div>

 * `||` can be replaced by `$or`
 * `&&` can be replaced by `$and`
 * `^^` can be replaced by `$xor`
 * `!` can be replaced by `$not`

The usage of `&&` is optional: if several conditions are in a same condition object, they'll be combined using a `&&` operator by default. So, both lines below are equivalent:
```ts
PhoneBook.find({ index: { '&&': [
	{ '<': 10 },
	{ '>=': 5 },
] } }).then(...);
PhoneBook.find({ index: {
	'<': 10,
	'>=': 5,
} }).then(...);
```

### Match by value in array, with **$in** <sup>(3)</sup>

<div markdown class="tabs tabs-code">
<div markdown class="tab" data-ref="diaspora">

#### Diaspora

```ts
PhoneBook.find({ id: { $in: [
	'9ff2c6d2-9b90-43b8-b6b6-d8767966a3e6',
	'd3d23cc1-46cd-4619-a044-4a30b75a38f6',
] } }).then(...);
```
</div>
<div markdown class="tab" data-ref="sql">

#### SQL

```sql
SELECT * FROM `PhoneBook` WHERE `id` IN (15, 16);
```
</div>
<div markdown class="tab" data-ref="mongodb">

#### MongoDB

```ts
db.getCollection('PhoneBook').find({ _id : { $in: [
    ObjectId("59bf7e38945e5adadfd83b1c"),
    ObjectId("59a56875ab7388e9b823331b"),
] } }).then(...);
```
</div>
</div>

## Update queries

Update queries are used only with `update` operations.

## Query options

Query options can be passed to `find`, `update` and `delete` operations.

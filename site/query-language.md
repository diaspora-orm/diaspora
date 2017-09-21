---
layout: default
title: Query Language
toc: true
inMenu: true
---

# Query language

## Match queries

Match queries are used when you use `find`, `update` or `delete` operations.

<div class="note info">
Numbers in parenthesis in name indicates the Query Language Specification Level. Check your adapters' documentation to see the level supported by adapters you use.
</div>

### Match all ^\(1\)

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
PhoneBook.findMany({}).then(...);
{% endhighlight %}
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `PhoneBook`;
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection( 'PhoneBook' ).find({}).then(...);
{% endhighlight %}
</div>
</div>

### Match by field value ^\(1\)

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
PhoneBook.find({ id: '9ff2c6d2-9b90-43b8-b6b6-d8767966a3e6' }).then(...); // Match a single entity that have this value
PhoneBook.findMany({ phone: undefined }).then(...); // Match all entities that does not have a `phone`
{% endhighlight %}
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `PhoneBook` WHERE `id`=15;
SELECT * FROM `PhoneBook` WHERE `phone` IS NULL;
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection( 'PhoneBook' ).find({ _id: ObjectId("59bf7e38945e5adadfd83b1c") }).then(...);
db.getCollection( 'PhoneBook' ).find({ phone: { $exists: false } }).then(...);
{% endhighlight %}
</div>
</div>

### Match by a value or not, with **==** and **!=** ^\(2\)

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
PhoneBook.find({ number: { '==': '(251) 546-9442' } }).then(...);
PhoneBook.find({ number: { '!=': '(251) 546-9442' } }).then(...);
{% endhighlight %}
The usage of <code>==</code> is optional, you can replace <code>{'==': value}</code> with <code>value</code>
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `PhoneBook` WHERE `number` = "(251) 546-9442";
SELECT * FROM `PhoneBook` WHERE `number` != "(251) 546-9442";
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection( 'PhoneBook' ).find({ number : '(251) 546-9442' }).then(...);
db.getCollection( 'PhoneBook' ).find({ number : { $ne: '(251) 546-9442' } }).then(...);
{% endhighlight %}
</div>
</div>

 * `==` can be replaced by `$equal`
 * `!=` can be replaced by `$diff`

### Match by number comparaison, with **<**, **<=**, **>** and **>=** ^\(2\)

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
PhoneBook.find({ index: { '>': 12 } }).then(...);
PhoneBook.find({ index: { '>=': 12 } }).then(...);
PhoneBook.find({ index: { '<': 12 } }).then(...);
PhoneBook.find({ index: { '<=': 12 } }).then(...);
{% endhighlight %}
<blockquote>
<b>Tip: </b> You should read comparaison operators like this:
<code>"Index is greater that 12"</code>
</blockquote>
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `PhoneBook` WHERE `index` > 12;
SELECT * FROM `PhoneBook` WHERE `index` >= 12;
SELECT * FROM `PhoneBook` WHERE `index` < 12;
SELECT * FROM `PhoneBook` WHERE `index` <= 12;
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection( 'PhoneBook' ).find({ index: { $gt: 12 } }).then(...);
db.getCollection( 'PhoneBook' ).find({ index: { $gte: 12 } }).then(...);
db.getCollection( 'PhoneBook' ).find({ index: { $lt: 12 } }).then(...);
db.getCollection( 'PhoneBook' ).find({ index: { $lte: 12 } }).then(...);
{% endhighlight %}
</div>
</div>

 * `<` can be replaced by `$less`
 * `<=` can be replaced by `$lessEqual`
 * `>` can be replaced by `$greater`
 * `>=` can be replaced by `$greaterEqual`
 
### Do logical operations, with **||**, **&&**, **\^\^** and **!** ^\(3\)

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
PhoneBook.find({ index:{ '||': [
	{ '<': 5 },
	{ '==': 9 },
] }).then(...); // Will retrieve items with index [0, 1, 2, 3, 4, 9]
PhoneBook.find({ index:{ '&&': [
	{ '<': 10 },
	{ '>=': 5 },
] }).then(...); // Will retrieve items with index [5, 6, 7, 8, 9]
PhoneBook.find({ index:{ '^^': [
	{ email: 'foobar@example.com' },
	{ phone: '(251) 546-9442' },
] }).then(...); // Will retrieve items with either the provided email or address, but not both
PhoneBook.find({ index: { '!': { '==': 5 } } }).then(...);
{% endhighlight %}
<div class="note info">
The usage of <code>==</code> is optional, you can replace <code>{'==': value}</code> with <code>value</code>
</div>
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
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
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
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
{% endhighlight %}
<div class="note warning">
Last query is not exactly the same though... TODO Improve
</div>
</div>
</div>

 * `||` can be replaced by `$or`
 * `&&` can be replaced by `$and`
 * `^^` can be replaced by `$xor`
 * `!` can be replaced by `$not`

### Match by value in array, with **$in** ^\(3\)

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
PhoneBook.find({ id: { $in: [
	'9ff2c6d2-9b90-43b8-b6b6-d8767966a3e6',
	'd3d23cc1-46cd-4619-a044-4a30b75a38f6',
] } }).then(...);
{% endhighlight %}
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `PhoneBook` WHERE `id` IN (15, 16);
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection('PhoneBook').find({ _id : { $in: [
    ObjectId("59bf7e38945e5adadfd83b1c"),
    ObjectId("59a56875ab7388e9b823331b"),
] } }).then(...);
{% endhighlight %}
</div>
</div>

## Update queries

Update queries are used only with `update` operations.

## Comments

<div id="disqus_thread"></div>
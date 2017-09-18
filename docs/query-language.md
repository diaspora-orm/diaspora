---
layout: default
---

## Match all

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
phones.findMany({}).then(...);
{% endhighlight %}
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `phones`;
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection('phones').find({}).then(...);
{% endhighlight %}
</div>
</div>

## Match one by id

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
phones.find({id:'9ff2c6d2-9b90-43b8-b6b6-d8767966a3e6'}).then(...);
{% endhighlight %}
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `phones` WHERE `id`=15;
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection('phones').find({_id : ObjectId("59bf7e38945e5adadfd83b1c")}).then(...);
{% endhighlight %}
</div>
</div>

## Match by a value or not, with **==** and **!=**

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
phones.find({ number:{ '==': '(251) 546-9442' } }).then(...);
phones.find({ number:{ '!=': '(251) 546-9442' } }).then(...);
{% endhighlight %}
The usage of <code>==</code> is optional, you can replace <code>{'==': value}</code> with <code>value</code>
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `phones` WHERE `number` = "(251) 546-9442";
SELECT * FROM `phones` WHERE `number` != "(251) 546-9442";
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection('phones').find({ number : '(251) 546-9442' }).then(...);
db.getCollection('phones').find({ number : { $ne: '(251) 546-9442' } }).then(...);
{% endhighlight %}
</div>
</div>

 * `==` can be replaced by `$equal`
 * `!=` can be replaced by `$diff`

## Match by number comparaison, with **<**, **<=**, **>** and **>=**

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
phones.find({ index:{ '>': 12 } }).then(...);
phones.find({ index:{ '>=': 12 } }).then(...);
phones.find({ index:{ '<': 12 } }).then(...);
phones.find({ index:{ '<=': 12 } }).then(...);
{% endhighlight %}
<blockquote>
<b>Tip: </b> You should read comparaison operators like this:
<code>"Index is greater that 12"</code>
</blockquote>
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `phones` WHERE `index` > 12;
SELECT * FROM `phones` WHERE `index` >= 12;
SELECT * FROM `phones` WHERE `index` < 12;
SELECT * FROM `phones` WHERE `index` <= 12;
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection('phones').find({ index:{ $gt: 12 } }).then(...);
db.getCollection('phones').find({ index:{ $gte: 12 } }).then(...);
db.getCollection('phones').find({ index:{ $lt: 12 } }).then(...);
db.getCollection('phones').find({ index:{ $lte: 12 } }).then(...);
{% endhighlight %}
</div>
</div>

 * `<` can be replaced by `$less`
 * `<=` can be replaced by `$lessEqual`
 * `>` can be replaced by `$greater`
 * `>=` can be replaced by `$greaterEqual`
 
## Do logical operations, with **||**, **&&**, **^^** and **!**

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
phones.find({ index:{ '||': [
	{ '<': 5 },
	{ '==': 9 },
]}).then(...); // Will retrieve items with index [0, 1, 2, 3, 4, 9]
phones.find({ index:{ '&&': [
	{ '<': 10 },
	{ '>=': 5 },
]}).then(...); // Will retrieve items with index [5, 6, 7, 8, 9]
phones.find({ index:{ '^^': [
	{ email: 'foobar@example.com' },
	{ phone: '(251) 546-9442' },
]}).then(...); // Will retrieve items with either the provided email or address, but not both
phones.find({ index: { '!':{ '==': 5 } } }).then(...);
{% endhighlight %}
The usage of <code>==</code> is optional, you can replace <code>{'==': value}</code> with <code>value</code>
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `phones` WHERE 
	(`index` < 5) OR
	(`index` = 9);
	
SELECT * FROM `phones` WHERE
	(`index` < 10) AND
	(`index` >= 10);
	
SELECT * FROM `phones` WHERE
	(`email` = "foobar@example.com") XOR
	(`phone` = "(251) 546-9442");
	
SELECT * FROM `phones` WHERE NOT (`index` == 5);
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection('phones').find({ $or: [
    { index: { $lt: 5 } },
    { index: { $eq: 9 } },
 ] }).then(...);
 db.getCollection('phones').find({ $and: [
    { index: { $lt: 10 } },
    { index: { $gte: 5 } },
 ] })
 db.getCollection('phones').find({ $xor: [
	{ email: { $eq: 'foobar@example.com' } },
	{ phone: { $eq: '(251) 546-9442' } },
 ] })
db.getCollection('phones').find({ index: { $ne: 5 } }).then(...);
{% endhighlight %}
Last query is not exactly the same though... TODO Improve
</div>
</div>

 * `||` can be replaced by `$or`
 * `&&` can be replaced by `$and`
 * `^^` can be replaced by `$xor`
 * `!` can be replaced by `$not`

## Match 2 by id, with **$in**

<div class="tabs tabs-code">
<div class="tab" data-ref="diaspora">

<h4>Diaspora</h4>

{% highlight javascript %}
phones.find({ id:{ $in: [
	'9ff2c6d2-9b90-43b8-b6b6-d8767966a3e6',
	'd3d23cc1-46cd-4619-a044-4a30b75a38f6',
] } }).then(...);
{% endhighlight %}
</div>
<div class="tab" data-ref="sql">

<h4>SQL</h4>

{% highlight sql %}
SELECT * FROM `phones` WHERE `id` IN (15, 16);
{% endhighlight %}
</div>
<div class="tab" data-ref="mongodb">

<h4>MongoDB</h4>

{% highlight javascript %}
db.getCollection('phones').find({ _id : { $in: [
    ObjectId("59bf7e38945e5adadfd83b1c"),
    ObjectId("59a56875ab7388e9b823331b"),
] } }).then(...);
{% endhighlight %}
</div>
</div>

<div id="disqus_thread"></div>
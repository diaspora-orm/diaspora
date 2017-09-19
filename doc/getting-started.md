---
layout: default
#title: Home
toc: true
---

# Getting started

## Install Diaspora

Diaspora is available on both the browser & Node.JS. Follow these steps to include Diaspora in your app:

### For Node.JS

<div class="tabs tabs-code">
<div class="tab" data-ref="npm">
<h3>With NPM</h3>
{% highlight shell %}
npm install --save diaspora
{% endhighlight %}
</div>

<!--<div class="tab" data-ref="yarn">
<h3>With Yarn</h3>
{% highlight shell %}
#npm install --save diaspora
{% endhighlight %}
</div> -->
</div>

### For the browser

<div class="warning">
Diaspora is not yet ready to be used in the browser. Come back later
</div>

## Configure Diaspora

### Creating a data source

{% highlight javascript %}
const NAMESPACE = 'myApp';
const inMemoryDataSource = Diaspora.createDataSource( 'inMemory', {} );
Diaspora.registerDataSource( NAMESPACE, 'myDataSource', inMemory );
{% endhighlight %}
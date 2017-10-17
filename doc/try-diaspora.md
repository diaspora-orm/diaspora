---
layout: tryDiaspora
title: Try Diaspora online
inMenu: true
description: "Try Diaspora online in your browser: test your queries and explore the API"
datasourceName: data2.js
---

# Try Diaspora online

You can test *Diaspora* using the Query Editor below. Collections available are `Drawings` and `Queries`. See the [Query Language](query-language.html) to see how you can query *Diaspora*.

<div class="note info">
Currently, only Query Language Specification level 2 is implemented. Some operators (such as <code>&&</code>, <code>!</code> or <code>$in</code>) are not yet available
</div>

<div class="lazyload unloaded">
<div class="loader"></div>

## History

<table markdown="0">
<thead>
<tr>
<th>Id</th>
<th>Query</th>
<th>Date</th>
<th>Action</th>
</tr>
</thead>
<tbody id="queriesHistory"></tbody>
</table>

## Query Editor

<div class="input-group" markdown="0">
<code id="query" class="form-control" >Drawings.findMany({})</code>
<div class="input-group-btn">
<button id="execquery" class="btn btn-default"><i class="glyphicon glyphicon-search"></i></button>
</div>
</div>
<button class="btn btn-default" id="resetData">Reset all data</button>

## Results

<table id="datatable" markdown="0">
<thead>
<tr>
<th>Name</th>
<th>Artist</th>
<th>Date</th>
<th>Movement</th>
<th>Type</th>
<th>Medium</th>
<th>Museum</th>
</tr>
</thead>
<tbody></tbody>
</table></div>

<div id="disqus_thread"></div>

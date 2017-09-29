---
layout: tryDiaspora
title: Try Diaspora online
inMenu: true
description: "Try Diaspora online in your browser: test your queries and explore the API"
datasourceName: data1.js
---

# Try Diaspora online

You can test *Diaspora* using the Query Editor below. Collections available are `PhoneBook` and `Queries`. See the [Query Language](query-language.html) to see how you can query *Diaspora*.

<div class="note info">
Currently, only Query Language Specification level 2 is implemented. Some operators (such as <code>&&</code>, <code>!</code> or <code>$in</code>) are not yet available
</div>

## History

<div class="lazyload unloaded"><div class="loader"></div><table><thead><tr><th>Id</th><th>Query</th><th>Date</th><th>Action</th></tr></thead><tbody id="queriesHistory"></tbody></table></div>

## Query Editor

<div class="lazyload unloaded"><div class="loader"></div><div class="input-group"><div id="query" class="form-control">PhoneBook.findMany({})</div><div class="input-group-btn"><button id="execquery" class="btn btn-default"><i class="glyphicon glyphicon-search"></i></button></div></div>
<button class="btn btn-default" id="resetData">Reset all data</button></div>

## Results

<div class="lazyload unloaded"><div class="loader"></div><table id="datatable">
<thead>
<tr>
<th>Id</th>
<th>Name</th>
<th>Phone</th>
<th>Email</th>
<th>Company</th>
<th>Country</th>
<th>State</th>
<th>City</th>
<th>Address</th>
</tr>
</thead>
<tbody></tbody>
</table></div>
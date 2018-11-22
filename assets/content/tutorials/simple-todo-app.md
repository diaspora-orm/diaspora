# ToDo application with _Diaspora_

## Introduction

Managing data is one of the most important part of an application, and many common patterns consider it as a specific module. For instance, the [MVC (_**Model** View Controller_)](!https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller), [MVP (_**Model** View Presenter_)](!https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter) & [MVVM (_**Model**-View View-**Model**_)](!https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) have all a dedicated part for data management, called **Model**.

Because it is built as an ORM, **Diaspora** is able to take care of most of the **Model** module, because it allows abstraction on the data. By using such tools, you can only write code to insert, modify or retrieve data from a store, without writing additional logic to convert your raw stored data into logical components living in your application.

The **adapter** approach for an ORM adds an interesting possibility to speed up our apps evolution, and thus, our development. We'll demonstrate it by switching our **data source** at the end of this tutorial, changing from the *page memory* to a *session-persistent store*, the *local storage*.

 The goal of this tutorial is to do the same *ToDo* app than the one presented on [TodoMVC](!http://todomvc.com/), which allows to compare many frameworks implementation for the same result. You can find the full application specification on [their GitHub repository](!https://github.com/tastejs/todomvc/blob/master/app-spec.md).

## Preparing the application

### Choosing the tools

> We'll use Backbone.js to manage our data.... Just kidding.

Diaspora being written in Typescript, you can take advantage of the typings mechanisms it provides. We'll also use [*Vue.js*](!https://vuejs.org/) as the **MVVM** framework, and a nice library to write _components_ as classes called [vue-property-decorator](!https://www.npmjs.com/package/vue-property-decorator). Finally, we'll build the application using [webpack](!https://webpack.js.org/). I'll give you most of the *Vue.js*-related code, to let you focus on the usage of Diaspora. Also, we won't focus on optimization by mutualizing queries, but on the usage of *as many methods as possible* to match the app's requirements.

> You can check out the [tutorial repository](!https://github.com/diaspora-orm/simple-todo-app) for reference during this tutorial.

### Using the tutorial's template ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/c274e1c7cb6e2273058d3c19e72994ac64d8aecf))

Clone the repository, check out the *tutorial-start* branch and install package dependencies to get started with the template. This template is already configured with all dependencies & build scripts.

```sh
git clone -n https://github.com/diaspora-orm/simple-todo-app.git
cd simple-todo-app
git checkout tutorial-start
npm i
```

Here is the list of configured commands, useful for the development:

* `npm run start`: Start *webpack* in **watch** mode (for development)
* `npm run build`: Build the application (for production)

> Tests are not yet doable for this application. See this [tastejs issue](https://github.com/tastejs/todomvc/issues/1935) they did not replied yet, about a change required by Diaspora's format of *localstorage* serialization.

The template application uses 2 *Vue.js* components:

* the **AppComponent** that contains the input to create new *ToDos*, filters, and actions to manage all *ToDos*,
* and the **TodoItemComponent** that display, delete or update each *ToDo*.

## Bootstrap Diaspora

### Create the *data source* ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/e473ba795d00f88c3c05c1e4817f7c7454aa3e4f))

To create a data source, use the [`createNamedDataSource`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FDiasporaStatic#createNamedDataSource) method of the `Diaspora` class. This method takes the following arguments:

* __The name of the data source__: an arbitrary string used across Diaspora to identify a *data source* in various methods. We will call this *data source* `main`.
* __The type of the adapter__: one of the keys of the [`Diaspora.adapters`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FDiasporaStatic#adapters) object, that identify the kind of the *adapter*. We'll begin with the *in-memory adapter* identified by `inMemory`
* __Some optional configuration parameters__: see the *adapter*'s documentation to check the options you can set. The *in-memory adapter* does not have additionnal configurations, so we won't provide those parameters.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="ts">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/dataStore.ts</span>
        <span class="d2h-tag d2h-added d2h-added-tag">ADDED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -0,0 +1,4 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx"><span class="hljs-section">import</span> { <span class="hljs-attribute">Diaspora</span> } from <span class="hljs-string">'<span class="hljs-variable">@diaspora</span>/diaspora'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Initialize the data source</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">Diaspora.createNamedDataSource( <span class="hljs-string">'main'</span>, <span class="hljs-string">'inMemory'</span> );</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

> Depending on the kind of *adapter* you are creating, it may require some time to be fully initialized and ready to use. In this case, use the [`AAdapter.waitReady`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FAdapter%2FBase%2FAAdapter#waitReady) method that returns a *Promise*. But in our case, the *in-memory adapter* is instantly ready, so we don't need to wait.

### Defining *models* and ToDo attributes

#### Analyse the nature of the data ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/8b5d150c28f48d8062028feb9fa8a3005a7ea57f))

Our application will manipulate *ToDos*, that are represented by the following attributes:

* a *label* which is a **required string**,
* a *finished* status which is a **required boolean**,
* and an *ID* that should identify our item.

Diaspora manages the *ID* for us, with the model's adapter *ID generation process*. This is part of Diaspora's approach: manage data the same way, wherever it comes from, without having to take care of each store difference. Diaspora will also use its own polyfills to try to do itself what the store cannot do.
In this case, if our store was a *MongoDB* database, the ID would be generated by the database directly, but in the *memory* or the *local storage*, it should be generated by Diaspora itself. We'll explain that later.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="ts">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/dataStore.ts</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -2,3 +2,10 @@ import { Diaspora } from '@diaspora/diaspora';</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">2</div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">3</div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Initialize the data source</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">4</div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">Diaspora.createNamedDataSource( <span class="hljs-string">'main'</span>, <span class="hljs-string">'inMemory'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Interface describing the attributes of a ToDo item.</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Because the ID is a property of the Entity, we don't declare it here.</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">export <span class="hljs-keyword">interface</span> <span class="hljs-title">ITodo</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    label: <span class="hljs-built_in">string</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">finished</span>: boolean;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

#### Declare the *model* ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/b07e7703d06a91239bb2afb9e3dc28003ddf5282))

Each data type is manipulated through a *model*, that is generated using the [`Diaspora.declareModel`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FDiasporaStatic#declareModel) method, which takes the following arguments:

* __The name of the model__: an arbitrary string that name the kind of data the model manipulates. It is used to determine the name of the *collection* (or *table*) that will contain our data. Here, we are manipulating `ToDos`.
* __A configuration object__ [`IModelDescription`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FRaw%2FIModelDescription), that contains at least the following properties:
    * __The sources__ in which we are storing the data (the `main` data source in our example)
    * __The attributes__ of the data, with their type, default value or a flag to indicates if the property is required for the entity to be valid.

This method also takes a type parameter to help Typescript know what the `attributes` of our entities looks like. Our entities of the `ToDos` model will contain the `ITodo` interface defined above.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="ts">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/dataStore.ts</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -1,4 +1,4 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">1</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn nginx"><span class="hljs-section">import</span> { <span class="hljs-attribute">Diaspora</span> } from <span class="hljs-string">'<span class="hljs-variable">@diaspora</span>/diaspora'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Diaspora<ins>,</ins> <ins>EFieldType </ins>} <span class="hljs-keyword">from</span> <span class="hljs-string">'@diaspora/diaspora'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">2</div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">3</div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Initialize the data source</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">4</div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">Diaspora.createNamedDataSource( <span class="hljs-string">'main'</span>, <span class="hljs-string">'inMemory'</span> );</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -9,3 +9,18 @@ export interface ITodo{</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">9</div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    label: <span class="hljs-built_in">string</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">10</div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">finished</span>: boolean;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">11</div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Define &amp; export the Model</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript"><span class="hljs-keyword">export</span> <span class="hljs-keyword">const</span> ToDos = Diaspora.declareModel&lt;ITodo&gt;( <span class="hljs-string">'ToDos'</span>, {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">15</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    sources: <span class="hljs-string">'main'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">16</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">attributes</span>: {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">17</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">        <span class="hljs-attribute">label</span>: {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">18</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn scala">            <span class="hljs-class"><span class="hljs-keyword">type</span></span>: <span class="hljs-type">EFieldType</span>.<span class="hljs-type">STRING</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">19</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            required: <span class="hljs-literal">true</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">20</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">21</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">        <span class="hljs-attribute">finished</span>: {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">22</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn scala">            <span class="hljs-class"><span class="hljs-keyword">type</span></span>: <span class="hljs-type">EFieldType</span>.<span class="hljs-type">BOOLEAN</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">23</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">            <span class="hljs-keyword">default</span>: <span class="hljs-literal">false</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">24</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">25</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">26</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">} );</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

---

We are done with configuration ! Let's start the actual implementation & usage of our new model.

## Use the model

### Finding *ToDos*

#### Create mock data ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/09d0e43459f34f67db6bf6d89918516d72ad9fe5))

Because we are using the *in-memory adapter*, our data source is reinitialized every time we reload the page, so we need to insert fake data to use when the application starts. Vue.js will call the `mounted` method when creating our app's *component*, so we can use it before doing the actual search.

We'll see more about the `insert` & `insertMany` methods later, so just trust me for now and write the following:

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -32,11 +32,22 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">32</div>
    <div class="line-num2">32</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml"><span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">lang</span>=<span class="hljs-string">"ts"</span>&gt;</span><span class="undefined"></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">33</div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Vue, Component } <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-property-decorator'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">34</div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { ToDos } <span class="hljs-keyword">from</span> <span class="hljs-string">'../dataStore'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">35</div>
    <div class="line-num2">36</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> TodoItemComponent <span class="hljs-keyword">from</span> <span class="hljs-string">'./TodoItem.vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">36</div>
    <div class="line-num2">37</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">37</div>
    <div class="line-num2">38</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">@<span class="hljs-keyword">Component</span>( {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">38</div>
    <div class="line-num2">39</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">components</span>: { TodoItemComponent },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">39</div>
    <div class="line-num2">40</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">} )</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">40</div>
    <div class="line-num2">41</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn scala">export <span class="hljs-keyword">default</span> <span class="hljs-class"><span class="hljs-keyword">class</span> <span class="hljs-title">AppComponent</span> <span class="hljs-keyword">extends</span> <span class="hljs-title">Vue</span> </span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">42</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Initialization</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">43</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">44</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// When starting up the app, insert fake data</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">45</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">async</span> <span class="hljs-title">mounted</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">46</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> ToDos.insertMany( [</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">47</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Check the documentation'</span>, finished: true },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">48</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Finish the tutorial'</span>, finished: false },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">49</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">50</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// <span class="hljs-doctag">TODO:</span> Do searches with the model...</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">51</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">41</div>
    <div class="line-num2">52</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">42</div>
    <div class="line-num2">53</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/script&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

#### Querying for data ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/1cc3a51dfe45cfbbbd2fe098bce04fb77da66783))

After reading the [application specification](!https://github.com/tastejs/todomvc/blob/master/app-spec.md), we can conclude that our app will require 3 kinds of *ToDos* search results:

* The number of **unfinished** *ToDos*, to generate the text in the footer (eg: `0 items left`, `1 item left`, `42 items left`)
* A list containing the *ToDos* to **display**
* And a query checking if the model contains **any kind** of *ToDo*, that we'll use to hide the header & footer of the app.

> Diaspora has not yet methods to check if a kind of item exists nor getting directly the count of items matching a query. See [this GitHub issue](!https://github.com/diaspora-orm/diaspora/issues/25) about adding the `has` and `count` methods. Meanwhile, we'll check if the `find` query returned an *entity*, and use the `length` property of the `findMany`'s resolution *set*.

For now, we'll display **all** *ToDos*, and we'll add the different kinds of searches later.

Searches methods ([`Model.find`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#find) & [`Model.findMany`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#findMany)) takes following parameters:

* __The search query__ <a href="/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FQueryLanguage%2FRaw%2FSearchQuery" target="_blank" id="search-query" class="anchor">`SearchQuery`</a>: an object or array describing the entities to match. Since we are doing simple equality comparisons, we can use the simplest form of the query language (eg, `{ finished: true }` to find entities with `finished` equals to true).
* __An optional options object__ <a href="/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FQueryLanguage%2FRaw%2FIQueryOptions" target="_blank" id="options-object" class="anchor">`IQueryOptions`</a>: used to customize query, skip items or limit the size of the set.
* __An optional data-source resolvable value to fetch data from__ <a href="/api?see=TDataSource&symbolPath=@diaspora%2Fdiaspora%2FAdapter#TDataSource" target="_blank" id="datasource-resolvable" class="anchor">TDataSource</a>: it can be either the name of the data source (like `main` as defined above), a [data access layer](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FAdapter%2FDataAccessLayer) or an [adapter](@/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FAdapter%2FBase%2FAAdapter). This parameter is useful for models that exists in several data sources, but we'll see that in another tutorial.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -31,14 +31,60 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">31</div>
    <div class="line-num2">31</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">32</div>
    <div class="line-num2">32</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml"><span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">lang</span>=<span class="hljs-string">"ts"</span>&gt;</span><span class="undefined"></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">33</div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Vue, Component } <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-property-decorator'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript"><span class="hljs-keyword">import</span> { Entity, <span class="hljs-built_in">Set</span> } <span class="hljs-keyword">from</span> <span class="hljs-string">'@diaspora/diaspora'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">34</div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">35</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { ToDos } <span class="hljs-keyword">from</span> <span class="hljs-string">'../dataStore'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">36</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { ToDos<ins>,</ins> <ins>ITodo </ins>} <span class="hljs-keyword">from</span> <span class="hljs-string">'../dataStore'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">36</div>
    <div class="line-num2">37</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> TodoItemComponent <span class="hljs-keyword">from</span> <span class="hljs-string">'./TodoItem.vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">37</div>
    <div class="line-num2">38</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">38</div>
    <div class="line-num2">39</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">@<span class="hljs-keyword">Component</span>( {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">39</div>
    <div class="line-num2">40</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">components</span>: { TodoItemComponent },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">40</div>
    <div class="line-num2">41</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">} )</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">41</div>
    <div class="line-num2">42</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn scala">export <span class="hljs-keyword">default</span> <span class="hljs-class"><span class="hljs-keyword">class</span> <span class="hljs-title">AppComponent</span> <span class="hljs-keyword">extends</span> <span class="hljs-title">Vue</span> </span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">43</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDos searches</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">44</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">45</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## ToDos currently displayed</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">46</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">    public displayedTodos: <span class="hljs-keyword">Set</span>&lt;ITodo&gt; | <span class="hljs-literal">null</span> = <span class="hljs-literal">null</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">47</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">48</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## Boolean checking if the data source contains at least one ToDo</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">49</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">    <span class="hljs-regexp">//</span> It <span class="hljs-keyword">is</span> used to display <span class="hljs-keyword">or</span> hide the header &amp; footer.</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">50</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> hasTodos = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">51</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">52</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## Boolean checking if all ToDos are finished</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">53</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">private</span> allTodosFinished = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">54</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">55</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## Unfinished ToDos</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">56</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Used in the footer's text</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">57</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> leftTodos = <span class="hljs-number">0</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">58</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">59</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">60</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Search</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">61</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">62</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Refresh all ToDos searches.</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">63</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">private</span> <span class="hljs-keyword">async</span> <span class="hljs-title">refreshToDoSearches</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">64</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">        <span class="hljs-keyword">let</span> allTodos: <span class="hljs-built_in">Set</span>&lt;ITodo&gt;;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">65</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">        <span class="hljs-keyword">let</span> hasTodos: Entity&lt;ITodo&gt; | <span class="hljs-literal">null</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">66</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">        <span class="hljs-keyword">let</span> leftTodos: <span class="hljs-built_in">Set</span>&lt;ITodo&gt;;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">67</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">68</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">        [allTodos, hasTodos, leftTodos] = <span class="hljs-keyword">await</span> <span class="hljs-built_in">Promise</span>.all( [</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">69</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">            <span class="hljs-regexp">//</span> Assign to `<span class="javascript">displayedTodos</span>`, <span class="hljs-keyword">and</span> check <span class="hljs-keyword">if</span> all are finished <span class="hljs-keyword">for</span> `<span class="javascript">allTodosFinished</span>`</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">70</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.findMany</span>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">71</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">            // <span class="hljs-keyword">Check</span> <span class="hljs-keyword">if</span> <span class="hljs-literal">null</span> <span class="hljs-keyword">for</span> <span class="hljs-string">`hasTodos`</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">72</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.find</span>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">73</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">            <span class="hljs-regexp">//</span> Count the results <span class="hljs-keyword">for</span> `<span class="javascript">leftTodos</span>`</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">74</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.findMany</span>( { <span class="hljs-attribute">finished</span>: false } ),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">75</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">76</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.displayedTodos = allTodos;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">77</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">78</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// Assign to properties requiring additionnal logic</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">79</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.allTodosFinished = allTodos</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">80</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            <span class="hljs-selector-class">.toChainable</span>(<span class="hljs-selector-tag">Set</span><span class="hljs-selector-class">.ETransformationMode</span><span class="hljs-selector-class">.ATTRIBUTES</span>)</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">81</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            .every( <span class="hljs-function"><span class="hljs-params">todo</span> =&gt;</span> todo.finished )</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">82</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">            .<span class="hljs-keyword">value</span>();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">83</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.hasTodos = hasTodos !== <span class="hljs-literal">null</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">84</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.leftTodos = leftTodos.length;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">85</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">86</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">87</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">42</div>
    <div class="line-num2">88</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Initialization</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">43</div>
    <div class="line-num2">89</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">44</div>
    <div class="line-num2">90</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// When starting up the app, insert fake data</span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -47,7 +93,7 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">47</div>
    <div class="line-num2">93</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Check the documentation'</span>, finished: true },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">48</div>
    <div class="line-num2">94</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Finish the tutorial'</span>, finished: false },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">49</div>
    <div class="line-num2">95</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">        ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">50</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cpp">        <del><span class="hljs-comment">//</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment"><span class="hljs-doctag">TODO:</span> Do searches with the model...</span></del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">96</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <ins><span class="hljs-keyword">await</span></ins> <ins><span class="hljs-keyword">this</span>.refreshToDoSearches();</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">51</div>
    <div class="line-num2">97</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">52</div>
    <div class="line-num2">98</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">53</div>
    <div class="line-num2">99</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/script&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

#### Using data in views ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/0437136ba6705fa07372a672cb5e4a3263814add))

This part is mainly specific to Vue.js, so we won't enter too much in details. Simply apply the following changes in your code:

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table selecting-right">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -5,18 +5,24 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">5</div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">            &lt;input <span class="hljs-keyword">class</span>=<span class="hljs-string">"new-todo"</span> placeholder=<span class="hljs-string">"What needs to be done?"</span> autofocus /&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">6</div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/header&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">7</div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">        <span class="hljs-comment">&lt;!-- This section should be hidden by default and shown when there are todos --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">8</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cs">        &lt;section <span class="hljs-keyword">class</span>=<span class="hljs-string">"main"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">        &lt;section <span class="hljs-keyword">class</span>=<span class="hljs-string">"main</span><ins><span class="hljs-string">"</span> v-<span class="hljs-keyword">if</span>=<span class="hljs-string">"hasTodos</span></ins><span class="hljs-string">"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">9</div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-comment">&lt;!-- See *ToDos cleaning* below --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">10</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn scala">            &lt;input id=<span class="hljs-string">"toggle-all"</span> <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"toggle-all"</span> <span class="hljs-class"><span class="hljs-keyword">type</span></span>=<span class="hljs-string">"checkbox"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn scala">            &lt;input id=<span class="hljs-string">"toggle-all"</span> <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"toggle-all"</span> <span class="hljs-class"><span class="hljs-keyword">type</span></span>=<span class="hljs-string">"checkbox</span><ins><span class="hljs-string">"</span> v-model=<span class="hljs-string">"areAllFinished</span></ins><span class="hljs-string">"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">11</div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">            &lt;label <span class="hljs-keyword">for</span>=<span class="hljs-string">"toggle-all"</span>&gt;Mark all <span class="hljs-keyword">as</span> complete&lt;/label&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">12</div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">13</div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">            &lt;ul <span class="hljs-keyword">class</span>=<span class="hljs-string">"todo-list"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn xml">                <span class="hljs-comment">&lt;!-- Iterate on each ToDo. Because the `ID` depends on the source, --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">15</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn xml">                <span class="hljs-comment">&lt;!-- we have to specify which datasource's ID we should bind to.   --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">16</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">                &lt;todo-item-component</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">17</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">                    v-<span class="hljs-keyword">for</span>=<span class="hljs-string">"todo in displayedTodos.entities"</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">18</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn ruby">                    <span class="hljs-symbol">:todo=<span class="hljs-string">"todo"</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">19</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">                    v-bind:key=<span class="hljs-string">"todo.getId('main')"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">todo-item-component</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">14</div>
    <div class="line-num2">20</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">            <span class="hljs-section">&lt;/ul&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">15</div>
    <div class="line-num2">21</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/section&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">16</div>
    <div class="line-num2">22</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">        <span class="hljs-comment">&lt;!-- This footer should be hidden by default and shown when there are todos --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">17</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cs">        &lt;footer <span class="hljs-keyword">class</span>=<span class="hljs-string">"footer"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">23</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">        &lt;footer <span class="hljs-keyword">class</span>=<span class="hljs-string">"footer</span><ins><span class="hljs-string">"</span> v-<span class="hljs-keyword">if</span>=<span class="hljs-string">"hasTodos</span></ins><span class="hljs-string">"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">18</div>
    <div class="line-num2">24</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-comment">&lt;!-- This should be `0 items left` by default --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">19</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript">            &lt;span <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"todo-count"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name">strong</span></span></span><del><span class="xml"><span class="hljs-tag">&gt;</span>_<span class="hljs-tag">&lt;/</span></span></del><span class="xml"><span class="hljs-tag"><span class="hljs-name">strong</span>&gt;</span></span> <del>_</del> left&lt;<span class="hljs-regexp">/span&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">25</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            &lt;span <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"todo-count"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name">strong</span></span></span><ins><span class="xml"><span class="hljs-tag">&gt;</span>{{leftTodos}}<span class="hljs-tag">&lt;/</span></span></ins><span class="xml"><span class="hljs-tag"><span class="hljs-name">strong</span>&gt;</span></span> <ins>{{leftTodosLabel}}</ins> left&lt;<span class="hljs-regexp">/span&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">20</div>
    <div class="line-num2">26</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">21</div>
    <div class="line-num2">27</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">            &lt;ul <span class="hljs-keyword">class</span>=<span class="hljs-string">"filters"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">22</div>
    <div class="line-num2">28</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name">a</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"/#/"</span> &gt;</span>All<span class="hljs-tag">&lt;/<span class="hljs-name">a</span>&gt;</span></span><span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -52,10 +58,20 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">52</div>
    <div class="line-num2">58</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## Boolean checking if all ToDos are finished</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">53</div>
    <div class="line-num2">59</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">private</span> allTodosFinished = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">54</div>
    <div class="line-num2">60</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">61</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">    // Getter to <span class="hljs-keyword">use</span> <span class="hljs-string">`areAllFinished`</span> <span class="hljs-keyword">as</span> v-<span class="hljs-keyword">model</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">62</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">get</span> <span class="hljs-title">areAllFinished</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">63</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.allTodosFinished;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">64</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">65</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">55</div>
    <div class="line-num2">66</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## Unfinished ToDos</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">56</div>
    <div class="line-num2">67</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Used in the footer's text</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">57</div>
    <div class="line-num2">68</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> leftTodos = <span class="hljs-number">0</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">58</div>
    <div class="line-num2">69</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">70</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Get the singular or plural text to display in the footer</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">71</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">get</span> <span class="hljs-title">leftTodosLabel</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">72</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.leftTodos === <span class="hljs-number">1</span> ? <span class="hljs-string">'item'</span> : <span class="hljs-string">'items'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">73</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">74</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">59</div>
    <div class="line-num2">75</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">60</div>
    <div class="line-num2">76</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Search</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">61</div>
    <div class="line-num2">77</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/TodoItem.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -1,8 +1,8 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">1</div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;template&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">2</div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">    <span class="hljs-section">&lt;li&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">3</div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        &lt;div <span class="hljs-keyword">class</span>=<span class="hljs-string">"view"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">4</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn scala">            &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"toggle"</span> <span class="hljs-class"><span class="hljs-keyword">type</span></span>=<span class="hljs-string">"checkbox"</span> <del>/&gt;</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">5</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">label</span></span><del><span class="hljs-tag">&gt;</span>_<span class="hljs-tag">&lt;/</span></del><span class="hljs-tag"><span class="hljs-name">label</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn scala">            &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"toggle"</span> <span class="hljs-class"><span class="hljs-keyword">type</span></span>=<span class="hljs-string">"checkbox"</span> <ins>v-model=<span class="hljs-string">"finished"</span>&gt;</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">label</span></span><ins><span class="hljs-tag">&gt;</span>{{</ins>label<ins>}}<span class="hljs-tag">&lt;/<span class="hljs-name">label</span></span></ins><span class="hljs-tag">&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">6</div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">            &lt;button <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"destroy"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">7</div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/div&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">8</div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        &lt;input <span class="hljs-keyword">class</span>=<span class="hljs-string">"edit"</span> /&gt;</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -10,9 +10,31 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">10</div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/template&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">11</div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">12</div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml"><span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">lang</span>=<span class="hljs-string">"ts"</span>&gt;</span><span class="undefined"></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">13</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Vue, Component } <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-property-decorator'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Vue, Component<ins>,</ins> <ins>Prop </ins>} <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-property-decorator'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx"><span class="hljs-section">import</span> { <span class="hljs-attribute">Entity</span> } from <span class="hljs-string">'<span class="hljs-variable">@diaspora</span>/diaspora'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">15</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">16</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { ITodo } <span class="hljs-keyword">from</span> <span class="hljs-string">'../dataStore'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">14</div>
    <div class="line-num2">17</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">15</div>
    <div class="line-num2">18</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">@Component</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">16</div>
    <div class="line-num2">19</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn scala">export <span class="hljs-keyword">default</span> <span class="hljs-class"><span class="hljs-keyword">class</span> <span class="hljs-title">TodoItemComponent</span> <span class="hljs-keyword">extends</span> <span class="hljs-title">Vue</span> </span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">20</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">    <span class="hljs-regexp">//</span> Current ToDo <span class="hljs-keyword">of</span> <span class="hljs-keyword">this</span> component. The app provides it <span class="hljs-keyword">as</span> a parameter <span class="hljs-keyword">of</span> the component</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">21</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">    @Prop( { required: <span class="hljs-literal">true</span> } )</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">22</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> todo!: Entity&lt;ITodo&gt;;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">23</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">24</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Handy getter for the ToDo's label</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">25</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">get</span> <span class="hljs-title">label</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">26</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">27</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">28</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">29</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">        <span class="hljs-selector-tag">return</span> <span class="hljs-selector-tag">this</span><span class="hljs-selector-class">.todo</span><span class="hljs-selector-class">.attributes</span><span class="hljs-selector-class">.label</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">30</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">31</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">32</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Handy getter for the ToDo's finished state</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">get</span> <span class="hljs-title">finished</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">36</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">37</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">        <span class="hljs-selector-tag">return</span> <span class="hljs-selector-tag">this</span><span class="hljs-selector-class">.todo</span><span class="hljs-selector-class">.attributes</span><span class="hljs-selector-class">.finished</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">38</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">17</div>
    <div class="line-num2">39</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">18</div>
    <div class="line-num2">40</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/script&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

Now, look closer the iteration over each *ToDos* displayed:

```html
<todo-item-component
    v-for="todo in displayedTodos.entities"
    :todo="todo"
    v-bind:key="todo.getId('main')"></todo-item-component>
```

Vue.js requires a **key** when doing iterations, and this key should be unique. The entity's ID is ideal for this usage, **but** we have seen earlier that the ID is managed by Diaspora and should not be included as a property on your `ITodo` interface, because it depends on the *data source* we are using. To get it, we have to use the [`Entity.getId`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#getId) method, that takes a single parameter: a **data-source resolvable value** ([see above](#datasource-resolvable)).

That's it ! Our data is now correctly displayed in the list.

### Inserting *ToDos* ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/0e7f30176441b66c05b9d912786926546d18debb))

As said in [the specs](!https://github.com/tastejs/todomvc/blob/master/app-spec.md#user-content-new-todo), the input at the top of the app is used to enter the label of a new *ToDo*, that is then created with the `finished` status defined to false.

To insert data in the store, we'll use the [`Model.insert`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#insert) method, that takes the following arguments:

* __The source object__<a id="source-object" class="anchor"></a>: an object corresponding to the model's type parameter, that will be persisted in the data source.
* __An optional data-source resolvable value to insert data into__: [See above](#datasource-resolvable).

Once our item is inserted in the data source, we simply have to refresh our searches to display the new values.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -2,7 +2,7 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">2</div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">    <span class="hljs-section">&lt;div&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">3</div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        &lt;header <span class="hljs-keyword">class</span>=<span class="hljs-string">"header"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">4</div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">h1</span>&gt;</span>todos<span class="hljs-tag">&lt;/<span class="hljs-name">h1</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">5</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cs">            &lt;input <span class="hljs-keyword">class</span>=<span class="hljs-string">"new-todo"</span> placeholder=<span class="hljs-string">"What needs to be done?"</span> autofocus <del>/&gt;</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn java">            &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"new-todo"</span> placeholder=<span class="hljs-string">"What needs to be done?"</span> autofocus <ins><span class="hljs-meta">@keyup</span>.enter=<span class="hljs-string">"createTodo"</span> v-model=<span class="hljs-string">"newTodoLabel"</span>&gt;</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">6</div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/header&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">7</div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">        <span class="hljs-comment">&lt;!-- This section should be hidden by default and shown when there are todos --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">8</div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        &lt;section <span class="hljs-keyword">class</span>=<span class="hljs-string">"main"</span> v-<span class="hljs-keyword">if</span>=<span class="hljs-string">"hasTodos"</span>&gt;</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -100,6 +100,22 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">100</div>
    <div class="line-num2">100</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.leftTodos = leftTodos.length;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">101</div>
    <div class="line-num2">101</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">102</div>
    <div class="line-num2">102</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">103</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDos creation</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">104</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">105</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Model property that contains the label of the ToDo we are creating</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">106</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-keyword">public</span> newTodoLabel = <span class="hljs-string">''</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">107</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">108</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Trim the label, then inserts it in the store &amp; refresh the ToDos lists</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">109</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">async</span> <span class="hljs-title">createTodo</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">110</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-keyword">const</span> todoLabel = <span class="hljs-keyword">this</span>.newTodoLabel.trim();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">111</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">        <span class="hljs-keyword">if</span>(todoLabel === <span class="hljs-string">''</span>){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">112</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            <span class="hljs-built_in">return</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">113</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">114</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.newTodoLabel = <span class="hljs-string">''</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">115</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">        <span class="hljs-selector-tag">await</span> <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.insert</span>( { <span class="hljs-attribute">label</span>: todoLabel, finished: false } );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">116</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.refreshToDoSearches();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">117</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">118</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">103</div>
    <div class="line-num2">119</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">104</div>
    <div class="line-num2">120</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Initialization</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">105</div>
    <div class="line-num2">121</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/TodoItem.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -1,5 +1,6 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">1</div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;template&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">2</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn apache">    <span class="hljs-section">&lt;li</span><del><span class="hljs-section">&gt;</span></del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    &lt;li</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">        v-bind:<span class="hljs-keyword">class</span>=<span class="hljs-string">"{ completed: finished }"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">3</div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        &lt;div <span class="hljs-keyword">class</span>=<span class="hljs-string">"view"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">4</div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn scala">            &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"toggle"</span> <span class="hljs-class"><span class="hljs-keyword">type</span></span>=<span class="hljs-string">"checkbox"</span> v-model=<span class="hljs-string">"finished"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">5</div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">label</span>&gt;</span>{{label}}<span class="hljs-tag">&lt;/<span class="hljs-name">label</span>&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

Now, you can enter text in our label input, and press enter: the new *ToDo* is created, persisted, then displayed in the list.

### Updating *ToDos*

The update of *ToDos* can be done in two ways:

* By using the [`Model.update`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#update) or [`Model.updateMany`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#updateMany) methods, taking following parameters:
    * __The search query__: [See above](#search-query).
    * __The actual object update__<a id="object-update" class="anchor"></a>: an object that contains the properties to update, with the new values.
    * __An optional options object__: [See above](#options-object).
    * __An optional data-source resolvable value to update data from__: [See above](#datasource-resolvable).
* Or by using the [`Entity.persist`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#persist) and [`Set.persist`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FSet#persist) methods, taking a single optional parameter: a **data-source resolvable value** ([see above](#datasource-resolvable)).

In our case, we'll use both methods: the **AppComponent** updates all entities with [`Model.updateMany`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#updateMany), and **TodoItemComponent** instances will each update their own *ToDo* with [`Entity.persist`](/api?pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#persist).

#### Finish all *ToDos* ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/cd99f5d4142eded144bdac546b5f6edb0d0c3a84))

The checkbox at the left of our input is used to mark all items as finished or unfinished, depending on the current state of the checkbox. (see [the specs](!https://github.com/tastejs/todomvc/blob/master/app-spec.md#user-content-mark-all-as-complete)).

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -64,6 +64,11 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">64</div>
    <div class="line-num2">64</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.allTodosFinished;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">65</div>
    <div class="line-num2">65</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">66</div>
    <div class="line-num2">66</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">67</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">    // <span class="hljs-keyword">Set</span> all ToDos <span class="hljs-string">`finished`</span> status.</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">68</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-built_in">set</span> <span class="hljs-title">areAllFinished</span><span class="hljs-params">( finished: boolean )</span></span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">69</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        ToDos.updateMany( {}, { finished } ).<span class="hljs-keyword">then</span>( <span class="hljs-function"><span class="hljs-params">()</span> =&gt;</span> <span class="hljs-keyword">this</span>.refreshToDoSearches() );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">70</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">71</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">67</div>
    <div class="line-num2">72</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## Unfinished ToDos</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">68</div>
    <div class="line-num2">73</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Used in the footer's text</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">69</div>
    <div class="line-num2">74</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> leftTodos = <span class="hljs-number">0</span>;</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

#### Finish a single *ToDo* ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/ee84bb6e9e75b24a3b55aca21e40d7b4942b7749))

From the **TodoItemComponent**, we have access to the [`Entity`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity) it represents. Entities reflects an instance of data wherever it comes from or go to, and thus are a convinient way to manipulate the entity across several *data sources*. To update an entity, simply assign new values to its [`attributes`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#attributes), and eventually [`persist`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#persist) it.

> An [`Entity`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity) is the aggregation of snapshots of the data in all data sources. It is aware of how to refresh, modify or delete the original data, across all sources.
> Its [`attributes`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#attributes) are a representation of the data in the most up-to-date source. But because they are defined across several sources, we can't determine which data source to use.
> So, we'll need to get the snapshot of the entity from a specific data source, called *properties*. We can get all *properties*, through the [`getProperties`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#getProperties) method, or simply the `id`, through [`getId`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#getId). Both of those methods take a single argument: a [data-source resolvable value](#datasource-resolvable).

> Later on, we'll use multi-sourcing.

Because we are modifying a property used for queries from within a child component of the **AppComponent**, we need to trigger a search refresh every time a data is changed. We can do it by emitting events using *Vue.js* built-in event emitter, and bind that event at the **AppComponent** level.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -13,10 +13,12 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">13</div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">            &lt;ul <span class="hljs-keyword">class</span>=<span class="hljs-string">"todo-list"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">14</div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">                <span class="hljs-comment">&lt;!-- Iterate on each ToDo. Because the `ID` depends on the source, --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">15</div>
    <div class="line-num2">15</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">                <span class="hljs-comment">&lt;!-- we have to specify which datasource's ID we should bind to.   --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">16</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn xml">                <span class="hljs-comment">&lt;!-- When the item emits the `refresh` event, reload ToDos lists   --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">16</div>
    <div class="line-num2">17</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">                &lt;todo-item-component</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">17</div>
    <div class="line-num2">18</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">                    v-<span class="hljs-keyword">for</span>=<span class="hljs-string">"todo in displayedTodos.entities"</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">18</div>
    <div class="line-num2">19</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn ruby">                    <span class="hljs-symbol">:todo=<span class="hljs-string">"todo"</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">19</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript">                    v-bind:key=<span class="hljs-string">"todo.getId('main</span><del><span class="hljs-string">')"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">todo-item-component</span>&gt;</span></span></del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">20</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn perl">                    v-<span class="hljs-keyword">bind</span>:key=<span class="hljs-string">"todo.getId('main</span><ins><span class="hljs-string">')"</span></ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">21</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    @<span class="hljs-keyword">refresh</span>="<span class="hljs-keyword">refreshToDoSearches</span>"&gt;&lt;/<span class="hljs-keyword">todo</span>-<span class="hljs-keyword">item</span>-<span class="hljs-keyword">component</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">20</div>
    <div class="line-num2">22</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">            <span class="hljs-section">&lt;/ul&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">21</div>
    <div class="line-num2">23</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/section&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">22</div>
    <div class="line-num2">24</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">        <span class="hljs-comment">&lt;!-- This footer should be hidden by default and shown when there are todos --&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/TodoItem.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -30,12 +30,26 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">30</div>
    <div class="line-num2">30</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">        <span class="hljs-selector-tag">return</span> <span class="hljs-selector-tag">this</span><span class="hljs-selector-class">.todo</span><span class="hljs-selector-class">.attributes</span><span class="hljs-selector-class">.label</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">31</div>
    <div class="line-num2">31</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">32</div>
    <div class="line-num2">32</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">33</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cpp"><del>    <span class="hljs-comment">// Handy getter for the ToDo's finished state</span></del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDo edition</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">36</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## `finished` toggling</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">37</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Those are just handy shorthands to get/set the ToDo property, and persist it if required</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">34</div>
    <div class="line-num2">38</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">get</span> <span class="hljs-title">finished</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">35</div>
    <div class="line-num2">39</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">36</div>
    <div class="line-num2">40</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">37</div>
    <div class="line-num2">41</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">38</div>
    <div class="line-num2">42</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">        <span class="hljs-selector-tag">return</span> <span class="hljs-selector-tag">this</span><span class="hljs-selector-class">.todo</span><span class="hljs-selector-class">.attributes</span><span class="hljs-selector-class">.finished</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">39</div>
    <div class="line-num2">43</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">44</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-built_in">set</span> <span class="hljs-title">finished</span><span class="hljs-params">( finished: boolean )</span></span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">45</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">46</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">47</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">48</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.todo.attributes.finished = finished;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">49</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">        // Once the status is <span class="hljs-keyword">set</span>, <span class="hljs-keyword">save</span> <span class="hljs-keyword">then</span> ask the app <span class="hljs-keyword">to</span> reload its lists</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">50</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.todo.persist().<span class="hljs-keyword">then</span>( <span class="hljs-function"><span class="hljs-params">()</span> =&gt;</span> {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">51</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            this.<span class="hljs-variable">$emit</span>( <span class="hljs-string">'refresh'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">52</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        } );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">53</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">40</div>
    <div class="line-num2">54</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">41</div>
    <div class="line-num2">55</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/script&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

#### Update *ToDo* label ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/04f3e48e8d3cdd672b34600b2909de791068ea32))

Now that you understand better how to update entities, we'll do the label update a bit quicker. Because editing the label does not change the search results, we don't need to trigger a refresh.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
            <span class="d2h-file-name-wrapper">
            <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
            <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
        </svg></span>
            <span class="d2h-file-name">src/components/TodoItem.vue</span>
            <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
            </div>
            <div class="d2h-file-diff">
                <div class="d2h-code-wrapper">
                    <table class="d2h-diff-table">
                        <tbody class="d2h-diff-tbody">
                        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line d2h-info">@@ -1,12 +1,12 @@</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">1</div>
        <div class="line-num2">1</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;template&gt;</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">2</div>
        <div class="line-num2">2</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    &lt;li</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
            <div class="line-num1">3</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del hljs">
                <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cs">        v-bind:<span class="hljs-keyword">class</span>=<span class="hljs-string">"{ completed: finished }"</span>&gt;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">3</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">        v-bind:<span class="hljs-keyword">class</span>=<span class="hljs-string">"{ completed: finished</span><ins><span class="hljs-string">,</span></ins><span class="hljs-string"> </span><ins><span class="hljs-string">editing: isEditing </span></ins><span class="hljs-string">}"</span>&gt;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">4</div>
        <div class="line-num2">4</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        &lt;div <span class="hljs-keyword">class</span>=<span class="hljs-string">"view"</span>&gt;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">5</div>
        <div class="line-num2">5</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn scala">            &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"toggle"</span> <span class="hljs-class"><span class="hljs-keyword">type</span></span>=<span class="hljs-string">"checkbox"</span> v-model=<span class="hljs-string">"finished"</span>&gt;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
            <div class="line-num1">6</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del hljs">
                <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">label</span></span><del><span class="hljs-tag">&gt;</span>{{</del>label}}<span class="hljs-tag">&lt;/<span class="hljs-name">label</span>&gt;</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">6</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">label</span></span><ins><span class="hljs-tag"> @<span class="hljs-attr">dblclick</span>=<span class="hljs-string">"startEdit"</span>&gt;</span>{{</ins>label}}<span class="hljs-tag">&lt;/<span class="hljs-name">label</span>&gt;</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">7</div>
        <div class="line-num2">7</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">            &lt;button <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"destroy"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span></span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">8</div>
        <div class="line-num2">8</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/div&gt;</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-del">
            <div class="line-num1">9</div>
        <div class="line-num2"></div>
            </td>
            <td class="d2h-del hljs">
                <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cs">        &lt;input <span class="hljs-keyword">class</span>=<span class="hljs-string">"edit"</span> /&gt;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">9</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn java">        &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"edit"</span> <ins>v-model=<span class="hljs-string">"editedLabel"</span> <span class="hljs-meta">@blur</span>=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.enter=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.esc=<span class="hljs-string">"discardEdit"</span> </ins>/&gt;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">10</div>
        <div class="line-num2">10</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">    <span class="hljs-section">&lt;/li&gt;</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">11</div>
        <div class="line-num2">11</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/template&gt;</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">12</div>
        <div class="line-num2">12</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
            </td>
        </tr>
        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line d2h-info">@@ -30,6 +30,9 @@ export default class TodoItemComponent extends Vue {</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">30</div>
        <div class="line-num2">30</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">        <span class="hljs-selector-tag">return</span> <span class="hljs-selector-tag">this</span><span class="hljs-selector-class">.todo</span><span class="hljs-selector-class">.attributes</span><span class="hljs-selector-class">.label</span>;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">31</div>
        <div class="line-num2">31</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">32</div>
        <div class="line-num2">32</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">33</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># List element class flags</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">34</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> isEditing = <span class="hljs-literal">false</span>;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">35</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">33</div>
        <div class="line-num2">36</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">34</div>
        <div class="line-num2">37</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDo edition</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">35</div>
        <div class="line-num2">38</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    </span></div>
            </td>
        </tr>
        <tr>
            <td class="d2h-code-linenumber d2h-info"></td>
            <td class="d2h-info">
                <div class="d2h-code-line d2h-info">@@ -51,5 +54,41 @@ export default class TodoItemComponent extends Vue {</div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">51</div>
        <div class="line-num2">54</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">            this.<span class="hljs-variable">$emit</span>( <span class="hljs-string">'refresh'</span> );</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">52</div>
        <div class="line-num2">55</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">        } );</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">53</div>
        <div class="line-num2">56</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">57</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">58</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## Label edition</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">59</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// v-model property that contains the temporary label while editing</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">60</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-keyword">private</span> editedLabel = <span class="hljs-string">''</span>;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">61</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">62</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">    // When starting the edition, <span class="hljs-keyword">set</span> the <span class="hljs-string">`isEditing`</span> <span class="hljs-keyword">status</span> <span class="hljs-keyword">to</span> <span class="hljs-string">`true`</span> <span class="hljs-keyword">and</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">63</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">    // <span class="hljs-keyword">set</span> the <span class="hljs-keyword">input</span> <span class="hljs-keyword">value</span> <span class="hljs-keyword">with</span> the <span class="hljs-keyword">current</span> ToDo<span class="hljs-string">'s label</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">64</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-title">startEdit</span><span class="hljs-params">()</span></span>{</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">65</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">66</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">67</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">68</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.isEditing = <span class="hljs-literal">true</span>;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">69</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.editedLabel = <span class="hljs-keyword">this</span>.todo.attributes.label;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">70</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">71</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">72</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Exit the edit mode, set the ToDo label with the edited one &amp; persist the entity in data store</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">73</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">async</span> <span class="hljs-title">saveEdit</span>(<span class="hljs-params"></span>)</span>{</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">74</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">75</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">76</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">77</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.isEditing = <span class="hljs-literal">false</span>;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">78</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">79</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-keyword">const</span> editedLabel = <span class="hljs-keyword">this</span>.editedLabel.trim();</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">80</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn php">        <span class="hljs-comment">// The label is changed: persist the ToDo</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">81</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.todo.attributes.label = editedLabel;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">82</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.todo.persist();</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">83</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">84</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    </span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">85</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Exit the edit mode &amp; reset the input value</span></span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">86</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-title">discardEdit</span><span class="hljs-params">()</span></span>{</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">87</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">88</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">89</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">90</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.isEditing = <span class="hljs-literal">false</span>;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">91</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.editedLabel = <span class="hljs-keyword">this</span>.todo.attributes.label;</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-ins">
            <div class="line-num1"></div>
        <div class="line-num2">92</div>
            </td>
            <td class="d2h-ins hljs">
                <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">54</div>
        <div class="line-num2">93</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
            </td>
        </tr><tr>
            <td class="d2h-code-linenumber d2h-cntx">
            <div class="line-num1">55</div>
        <div class="line-num2">94</div>
            </td>
            <td class="d2h-cntx hljs">
                <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/script&gt;</span></span></div>
            </td>
        </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

### Deleting *ToDos* ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/64c7eae173216c71753a0e5ac6ff77d5f1179e68))

Just like for the update, we have 2 options to delete *ToDos*:

* Either by using the [`Model.delete`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#delete) or [`Model.deleteMany`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FModel#deleteMany) methods, taking following parameters:
    * __The search query__: [See above](#search-query).
    * __An optional options object__: [See above](#options-object).
    * __An optional data-source resolvable value to update data from__: [See above](#datasource-resolvable).
* Or by using the [`Entity.destroy`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FEntity#destroy) and [`Set.destroy`](/api??pkg=@diaspora%2Fdiaspora&v=0.3.0&symbolPath=@diaspora%2Fdiaspora%2FSet#destroy) methods, taking a single optional parameter: a **data-source resolvable value** ([see above](#datasource-resolvable)).

Again, we'll use both of them, using the *model* method at the **AppComponent** level, and the *entity* method in the **TodoItemComponent**.

This part requires a bit of extra-code for *Vue.js* to match the specs, by toggling a class on the **TodoItemComponent** `li` tag to display the **delete** button. We also have to edit the `saveEdit` method to delete the entity when the label is empty (or contains only whitespaces).

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -32,7 +32,7 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">32</div>
    <div class="line-num2">32</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name">a</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"/#/completed"</span>&gt;</span>Completed<span class="hljs-tag">&lt;/<span class="hljs-name">a</span>&gt;</span></span><span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">33</div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">            <span class="hljs-section">&lt;/ul&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">34</div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-comment">&lt;!-- Hidden if no completed items are left ↓ --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">35</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cs">            &lt;button <span class="hljs-keyword">class</span>=<span class="hljs-string">"clear-completed"</span>&gt;Clear completed&lt;/button&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn scala">            &lt;button <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"clear-completed</span><ins><span class="hljs-string">"</span> <span class="hljs-meta">@click</span>=<span class="hljs-string">"clearCompleted</span></ins><span class="hljs-string">"</span>&gt;<span class="hljs-type">Clear</span> completed&lt;/button&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">36</div>
    <div class="line-num2">36</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/footer&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">37</div>
    <div class="line-num2">37</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">    <span class="hljs-section">&lt;/div&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">38</div>
    <div class="line-num2">38</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/template&gt;</span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -124,6 +124,15 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">124</div>
    <div class="line-num2">124</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">125</div>
    <div class="line-num2">125</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">126</div>
    <div class="line-num2">126</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">127</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDos cleaning</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">128</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">129</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">    // <span class="hljs-keyword">Delete</span> all completed ToDos, <span class="hljs-keyword">then</span> <span class="hljs-keyword">refresh</span> the ToDos lists</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">130</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">async</span> <span class="hljs-title">clearCompleted</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">131</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">        <span class="hljs-selector-tag">await</span> <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.deleteMany</span>( {<span class="hljs-attribute">finished</span>: true} );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">132</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.refreshToDoSearches();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">133</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">134</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">135</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">127</div>
    <div class="line-num2">136</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Initialization</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">128</div>
    <div class="line-num2">137</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">129</div>
    <div class="line-num2">138</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// When starting up the app, insert fake data</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/TodoItem.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -1,10 +1,12 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">1</div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;template&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">2</div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    &lt;li</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">3</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cs">        v-bind:<span class="hljs-keyword">class</span>=<span class="hljs-string">"{ completed: finished, editing: isEditing </span><del><span class="hljs-string">}"</span>&gt;</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">        v-bind:<span class="hljs-keyword">class</span>=<span class="hljs-string">"{ completed: finished, editing: isEditing</span><ins><span class="hljs-string">,</span></ins><span class="hljs-string"> </span><ins><span class="hljs-string">destroy: isHovered }"</span></ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        @mouseover=<span class="hljs-string">"isHovered = true"</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        @mouseout=<span class="hljs-string">"isHovered = false"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">4</div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        &lt;div <span class="hljs-keyword">class</span>=<span class="hljs-string">"view"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">5</div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn scala">            &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"toggle"</span> <span class="hljs-class"><span class="hljs-keyword">type</span></span>=<span class="hljs-string">"checkbox"</span> v-model=<span class="hljs-string">"finished"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">6</div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">label</span> @<span class="hljs-attr">dblclick</span>=<span class="hljs-string">"startEdit"</span>&gt;</span>{{label}}<span class="hljs-tag">&lt;/<span class="hljs-name">label</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">7</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript">            &lt;button <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"destroy"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            &lt;button <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"destroy</span><ins><span class="hljs-string">"</span> @click=<span class="hljs-string">"removeTodo</span></ins><span class="hljs-string">"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">8</div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/div&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">9</div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn java">        &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"edit"</span> v-model=<span class="hljs-string">"editedLabel"</span> <span class="hljs-meta">@blur</span>=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.enter=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.esc=<span class="hljs-string">"discardEdit"</span> /&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">10</div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">    <span class="hljs-section">&lt;/li&gt;</span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -31,6 +33,7 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">31</div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">32</div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># List element class flags</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">33</div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> isEditing = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">36</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> isHovered = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">34</div>
    <div class="line-num2">37</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">35</div>
    <div class="line-num2">38</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">36</div>
    <div class="line-num2">39</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDo edition</span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -76,9 +79,14 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">76</div>
    <div class="line-num2">79</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.isEditing = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">77</div>
    <div class="line-num2">80</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">78</div>
    <div class="line-num2">81</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">        <span class="hljs-keyword">const</span> editedLabel = <span class="hljs-keyword">this</span>.editedLabel.trim();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">79</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn php">        <del><span class="hljs-comment">//</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">The</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">label</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">is</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">changed:</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">persist the ToDo</span></del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">80</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><del>        <span class="hljs-keyword">this</span>.todo.attributes.</del>label <del>=</del> <del>editedLabel;</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">81</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><del>        </del><span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.<del>todo.persist</del>();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">82</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">        <ins><span class="hljs-keyword">if</span></ins> <ins>(</ins> <ins>editedLabel</ins> <ins>===</ins> <ins><span class="hljs-string">''</span></ins> <ins>){</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">83</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn php"><ins>            <span class="hljs-comment">// The </span></ins><span class="hljs-comment">label </span><ins><span class="hljs-comment">is</span></ins><span class="hljs-comment"> </span><ins><span class="hljs-comment">empty: remove the ToDo</span></ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">84</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><ins>            </ins><span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.<ins>removeTodo</ins>();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">85</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">        } <span class="hljs-keyword">else</span> {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">86</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn php">            <span class="hljs-comment">// The label is changed: persist the ToDo</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">87</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">            <span class="hljs-keyword">this</span>.todo.attributes.label = editedLabel;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">88</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">            <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.todo.persist();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">89</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">82</div>
    <div class="line-num2">90</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">83</div>
    <div class="line-num2">91</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">84</div>
    <div class="line-num2">92</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Exit the edit mode &amp; reset the input value</span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -89,5 +97,13 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">89</div>
    <div class="line-num2">97</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.isEditing = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">90</div>
    <div class="line-num2">98</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.editedLabel = <span class="hljs-keyword">this</span>.todo.attributes.label;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">91</div>
    <div class="line-num2">99</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">100</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">101</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">102</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDo removal</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">103</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">async</span> <span class="hljs-title">removeTodo</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">104</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.todo.destroy();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">105</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// Search results are changed: ask the app to refresh searches</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">106</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">        this.<span class="hljs-variable">$emit</span>( <span class="hljs-string">'refresh'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">107</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">92</div>
    <div class="line-num2">108</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">93</div>
    <div class="line-num2">109</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/script&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

If you try the application now, you can see that an error is thrown when deleting the entity. This is normal, because the entity reflects the state of an item in data sources. Just after the call of `Entity.destroy`, the entity's attributes for the data source is set to `null`, because the entity does not exist anymore in the source, but still exists in your code, but *Vue.js* detects a change. That's why we need to add a flag on the **TodoItemcomponent** to prevent the component from accessing our entity's attributes after deletion.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/TodoItem.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -23,8 +23,15 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">23</div>
    <div class="line-num2">23</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">    @Prop( { required: <span class="hljs-literal">true</span> } )</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">24</div>
    <div class="line-num2">24</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> todo!: Entity&lt;ITodo&gt;;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">25</div>
    <div class="line-num2">25</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">26</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">    <span class="hljs-regexp">//</span> Flag to avoid errors <span class="hljs-keyword">when</span> entity <span class="hljs-keyword">is</span> deleted</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">27</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">private</span> deleted = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">28</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">26</div>
    <div class="line-num2">29</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Handy getter for the ToDo's label</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">27</div>
    <div class="line-num2">30</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">get</span> <span class="hljs-title">label</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">31</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// Trap the error on deletion</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">32</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( <span class="hljs-keyword">this</span>.deleted ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            <span class="hljs-built_in">return</span> <span class="hljs-string">''</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">28</div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">29</div>
    <div class="line-num2">36</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">30</div>
    <div class="line-num2">37</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -41,6 +48,10 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">41</div>
    <div class="line-num2">48</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment">## `finished` toggling</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">42</div>
    <div class="line-num2">49</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Those are just handy shorthands to get/set the ToDo property, and persist it if required</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">43</div>
    <div class="line-num2">50</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">get</span> <span class="hljs-title">finished</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">51</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// Trap the error on deletion</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">52</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( <span class="hljs-keyword">this</span>.deleted ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">53</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            <span class="hljs-built_in">return</span> <span class="hljs-literal">true</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">54</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">44</div>
    <div class="line-num2">55</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">if</span> ( !<span class="hljs-keyword">this</span>.todo.attributes ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">45</div>
    <div class="line-num2">56</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Entity is in invalid state'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">46</div>
    <div class="line-num2">57</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -101,6 +112,7 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">101</div>
    <div class="line-num2">112</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">102</div>
    <div class="line-num2">113</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDo removal</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">103</div>
    <div class="line-num2">114</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">async</span> <span class="hljs-title">removeTodo</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">115</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.deleted = <span class="hljs-literal">true</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">104</div>
    <div class="line-num2">116</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.todo.destroy();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">105</div>
    <div class="line-num2">117</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// Search results are changed: ask the app to refresh searches</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">106</div>
    <div class="line-num2">118</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">        this.<span class="hljs-variable">$emit</span>( <span class="hljs-string">'refresh'</span> );</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

---

Do you feel this feeling? We are almost done ! You have seen the different usages of Diaspora, so you can stop the tutorial here. Most of the developments left are specific to *Vue.js*, to match completely the application specifications.

## Finalize the application

### Implement other kinds of displays ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/b5be2fd527baeeee3c59243516a768618fb8a582))

The app should have 3 different kinds of displays:

* All *ToDos*, that we already implemented,
* Only **finished** *ToDos*, where the search criterion is `{ finished: true }`,
* Only **unfinished** *ToDos*, where the search criterion is `{ finished: false }`.

We'll use an enum to differenciate each display mode.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -44,6 +44,13 @@ import { Entity, Set } from '@diaspora/diaspora';</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">44</div>
    <div class="line-num2">44</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { ToDos, ITodo } <span class="hljs-keyword">from</span> <span class="hljs-string">'../dataStore'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">45</div>
    <div class="line-num2">45</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> TodoItemComponent <span class="hljs-keyword">from</span> <span class="hljs-string">'./TodoItem.vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">46</div>
    <div class="line-num2">46</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">47</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-regexp">//</span> Display modes <span class="hljs-keyword">of</span> the app. It <span class="hljs-keyword">is</span> used to filter ToDos</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">48</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp"><span class="hljs-keyword">enum</span> EDisplayMode{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">49</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">FINISHED</span> = <span class="hljs-number">1</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">50</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">UNFINISHED</span> = <span class="hljs-number">2</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">51</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">ALL</span> = EDisplayMode.FINISHED &amp; EDisplayMode.UNFINISHED,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">52</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">53</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">47</div>
    <div class="line-num2">54</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">@<span class="hljs-keyword">Component</span>( {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">48</div>
    <div class="line-num2">55</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">components</span>: { TodoItemComponent },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">49</div>
    <div class="line-num2">56</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">} )</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -82,21 +89,55 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">82</div>
    <div class="line-num2">89</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">83</div>
    <div class="line-num2">90</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Search</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">84</div>
    <div class="line-num2">91</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">92</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Current search mode, representing the status of the ToDos to display in the list</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">93</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn apache">    <span class="hljs-attribute">private</span> displayMode: EDisplayMode = EDisplayMode.<span class="hljs-literal">ALL</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">94</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">85</div>
    <div class="line-num2">95</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Refresh all ToDos searches.</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">86</div>
    <div class="line-num2">96</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">private</span> <span class="hljs-keyword">async</span> <span class="hljs-title">refreshToDoSearches</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">87</div>
    <div class="line-num2">97</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">        <span class="hljs-keyword">let</span> allTodos: <span class="hljs-built_in">Set</span>&lt;ITodo&gt;;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">88</div>
    <div class="line-num2">98</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">        <span class="hljs-keyword">let</span> hasTodos: Entity&lt;ITodo&gt; | <span class="hljs-literal">null</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">89</div>
    <div class="line-num2">99</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">        <span class="hljs-keyword">let</span> leftTodos: <span class="hljs-built_in">Set</span>&lt;ITodo&gt;;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">90</div>
    <div class="line-num2">100</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">91</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript">        <del>[allTodos,</del> <del>hasTodos,</del> <del>leftTodos]</del> <del>=</del> <del><span class="hljs-keyword">await</span> <span class="hljs-built_in">Promise</span>.all( [</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">92</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript">            <del><span class="hljs-regexp">//</span></del> <del>Assign</del> <del>to `<span class="javascript">displayedTodos</span>`, <span class="hljs-keyword">and</span> check <span class="hljs-keyword">if</span> all are finished <span class="hljs-keyword">for</span> `<span class="javascript">allTodosFinished</span>`</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">93</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn css"><del>            <span class="hljs-selector-tag">ToDos</span></del><span class="hljs-selector-class">.</span><del><span class="hljs-selector-class">findMany</span>(),</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">94</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn sql"><del>            </del>// <del><span class="hljs-keyword">Check</span></del> <span class="hljs-keyword">if</span> <del><span class="hljs-literal">null</span></del> <span class="hljs-keyword">for</span> <span class="hljs-string">`</span><del><span class="hljs-string">hasTodos</span></del><span class="hljs-string">`</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">95</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn css"><del>            </del><span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.</span><del><span class="hljs-selector-class">find</span></del>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">96</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><del>            </del><span class="hljs-regexp">//</span> <del>Count</del> <del>the</del> <del>results</del> <span class="hljs-keyword">for</span> `<del><span class="javascript">leftTodos</span></del>`</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">97</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn css"><del>            </del><span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.</span><del><span class="hljs-selector-class">findMany</span>( { <span class="hljs-attribute">finished</span>: false } ),</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">98</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn"><del>        ]</del> <del>);</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">99</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><del>        <span class="hljs-keyword">this</span></del>.<del>displayedTodos</del> <del>=</del> <del>allTodos;</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">101</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <ins><span class="hljs-keyword">switch</span></ins> <ins>(</ins> <ins><span class="hljs-keyword">this</span>.displayMode</ins> <ins>)</ins> <ins>{</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">102</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn apache">            <ins><span class="hljs-attribute">case</span></ins> <ins>EDisplayMode.<span class="hljs-literal">ALL</span>:</ins> <ins>{</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">103</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript"><ins>                [allTodos, hasTodos, leftTodos] = <span class="hljs-keyword">await</span> <span class="hljs-built_in">Promise</span></ins>.<ins>all( [</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">104</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><ins>                    </ins><span class="hljs-regexp">//</span> <ins>Assign</ins> <ins>to `<span class="javascript">displayedTodos</span>`, <span class="hljs-keyword">and</span> check </ins><span class="hljs-keyword">if</span> <ins>all</ins> <ins>are finished </ins><span class="hljs-keyword">for</span> `<ins><span class="javascript">allTodosFinished</span></ins>`</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">105</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css"><ins>                    </ins><span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.</span><ins><span class="hljs-selector-class">findMany</span></ins>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">106</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql"><ins>                    </ins>// <ins><span class="hljs-keyword">Check</span></ins> <ins><span class="hljs-keyword">if</span></ins> <ins><span class="hljs-literal">null</span></ins> <span class="hljs-keyword">for</span> <span class="hljs-string">`</span><ins><span class="hljs-string">hasTodos</span></ins><span class="hljs-string">`</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">107</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css"><ins>                    </ins><span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.</span><ins><span class="hljs-selector-class">find</span>(),</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">108</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><ins>                    <span class="hljs-regexp">//</span></ins> <ins>Count the results <span class="hljs-keyword">for</span> `<span class="javascript">leftTodos</span>`</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">109</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css"><ins>                    <span class="hljs-selector-tag">ToDos</span></ins><span class="hljs-selector-class">.</span><ins><span class="hljs-selector-class">findMany</span>(</ins> <ins>{</ins> <ins><span class="hljs-attribute">finished</span>: false } ),</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">110</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">                ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">111</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">                <span class="hljs-keyword">this</span>.displayedTodos = allTodos;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">112</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            } <span class="hljs-built_in">break</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">113</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">            </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">114</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            <span class="hljs-keyword">case</span> EDisplayMode.FINISHED: {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">115</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">                [<span class="hljs-keyword">this</span>.displayedTodos, allTodos, hasTodos, leftTodos] = <span class="hljs-keyword">await</span> <span class="hljs-built_in">Promise</span>.all( [</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">116</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">                    <span class="hljs-comment">// Displayed items</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">117</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.findMany</span>( { <span class="hljs-attribute">finished</span>: true } ),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">118</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">                    // <span class="hljs-keyword">Check</span> <span class="hljs-keyword">if</span> all <span class="hljs-keyword">are</span> finished <span class="hljs-keyword">for</span> <span class="hljs-string">`allTodosFinished`</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">119</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.findMany</span>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">120</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">                    // <span class="hljs-keyword">Check</span> <span class="hljs-keyword">if</span> <span class="hljs-literal">null</span> <span class="hljs-keyword">for</span> <span class="hljs-string">`hasTodos`</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">121</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.find</span>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">122</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">                    <span class="hljs-regexp">//</span> Count the results <span class="hljs-keyword">for</span> `<span class="javascript">leftTodos</span>`</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">123</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.findMany</span>( { <span class="hljs-attribute">finished</span>: false } ),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">124</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">                ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">125</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            } <span class="hljs-built_in">break</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">126</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">127</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            <span class="hljs-keyword">case</span> EDisplayMode.UNFINISHED: {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">128</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">                [allTodos, hasTodos, leftTodos] = <span class="hljs-keyword">await</span> <span class="hljs-built_in">Promise</span>.all( [</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">129</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">                    // <span class="hljs-keyword">Check</span> <span class="hljs-keyword">if</span> all <span class="hljs-keyword">are</span> finished <span class="hljs-keyword">for</span> <span class="hljs-string">`allTodosFinished`</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">130</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.findMany</span>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">131</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn sql">                    // <span class="hljs-keyword">Check</span> <span class="hljs-keyword">if</span> <span class="hljs-literal">null</span> <span class="hljs-keyword">for</span> <span class="hljs-string">`hasTodos`</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">132</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.find</span>(),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">133</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">                    <span class="hljs-regexp">//</span> Assign to `<span class="javascript">displayedTodos</span>`, <span class="hljs-keyword">and</span> count the results <span class="hljs-keyword">for</span> `<span class="javascript">leftTodos</span>`</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">134</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">                    <span class="hljs-selector-tag">ToDos</span><span class="hljs-selector-class">.findMany</span>( { <span class="hljs-attribute">finished</span>: false } ),</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">135</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">                ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">136</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">                <span class="hljs-keyword">this</span>.displayedTodos = leftTodos;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">137</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            } <span class="hljs-built_in">break</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">138</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">139</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">            <span class="hljs-keyword">default</span>: <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Error</span>( <span class="hljs-string">'Invalid search mode'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">140</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">100</div>
    <div class="line-num2">141</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">101</div>
    <div class="line-num2">142</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// Assign to properties requiring additionnal logic</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">102</div>
    <div class="line-num2">143</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.allTodosFinished = allTodos</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

### Add routing ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/30338d8c027e26335f7ae87d43691ea5494be363))

Depending on the *URL* of the application, the **AppComponent** should use a specific search mode. *Vue.js* has a **routing** plugin that we are going to use to detect changes on the url, and switch between the different search modes.

To make things clearer, we are going to move the *display mode*'s enumeration `EDisplayMode` to a different file. The main HTML file has to use the `router-view` too, that we provide to the *Vue* app. The app should also use the current URL to set the search mode by simulating a route change when the component is *mounted*, instead of simply running the default searches.

> Again, check out the [app specifications](!https://github.com/tastejs/todomvc/blob/master/app-spec.md#routing) about routing.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="html">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">index.html</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -9,7 +9,7 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">9</div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn html">    <span class="hljs-tag">&lt;/<span class="hljs-name">head</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">10</div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn html">    <span class="hljs-tag">&lt;<span class="hljs-name">body</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">11</div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn html">        <span class="hljs-tag">&lt;<span class="hljs-name">section</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"todoapp"</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"app"</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">12</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn html">            <span class="hljs-tag">&lt;</span><del><span class="hljs-tag"><span class="hljs-name">app</span></span></del><span class="hljs-tag"><span class="hljs-name">-</span></span><del><span class="hljs-tag"><span class="hljs-name">component</span></span></del><span class="hljs-tag">&gt;</span><span class="hljs-tag">&lt;/</span><del><span class="hljs-tag"><span class="hljs-name">app</span></span></del><span class="hljs-tag"><span class="hljs-name">-</span></span><del><span class="hljs-tag"><span class="hljs-name">component</span></span></del><span class="hljs-tag">&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn html">            <span class="hljs-tag">&lt;</span><ins><span class="hljs-tag"><span class="hljs-name">router</span></span></ins><span class="hljs-tag"><span class="hljs-name">-</span></span><ins><span class="hljs-tag"><span class="hljs-name">view</span></span></ins><span class="hljs-tag">&gt;</span><span class="hljs-tag">&lt;/</span><ins><span class="hljs-tag"><span class="hljs-name">router</span></span></ins><span class="hljs-tag"><span class="hljs-name">-</span></span><ins><span class="hljs-tag"><span class="hljs-name">view</span></span></ins><span class="hljs-tag">&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">13</div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn html">        <span class="hljs-tag">&lt;/<span class="hljs-name">section</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">14</div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn html">        <span class="hljs-tag">&lt;<span class="hljs-name">footer</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"info"</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">15</div>
    <div class="line-num2">15</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn html">            <span class="hljs-tag">&lt;<span class="hljs-name">p</span>&gt;</span>Double-click to edit a todo<span class="hljs-tag">&lt;/<span class="hljs-name">p</span>&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -27,9 +27,9 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">27</div>
    <div class="line-num2">27</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">            &lt;span <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"todo-count"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name">strong</span>&gt;</span>{{leftTodos}}<span class="hljs-tag">&lt;/<span class="hljs-name">strong</span>&gt;</span></span> {{leftTodosLabel}} left&lt;<span class="hljs-regexp">/span&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">28</div>
    <div class="line-num2">28</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">29</div>
    <div class="line-num2">29</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">            &lt;ul <span class="hljs-keyword">class</span>=<span class="hljs-string">"filters"</span>&gt;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">30</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;</span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-name">a</span></span></span></del><span class="xml"><span class="hljs-tag"> </span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-attr">href</span>=<span class="hljs-string">"/#/"</span></span></span></del><span class="xml"><span class="hljs-tag"> </span></span><del><span class="xml"><span class="hljs-tag">&gt;</span></span></del><span class="xml">All<span class="hljs-tag">&lt;/</span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-name">a</span></span></span></del><span class="xml"><span class="hljs-tag">&gt;</span></span><span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">31</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;</span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-name">a</span></span></span></del><span class="xml"><span class="hljs-tag"> </span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-attr">href</span>=<span class="hljs-string">"/#/</span></span></span></del><span class="xml"><span class="hljs-tag"><span class="hljs-string">active"</span>&gt;</span>Active<span class="hljs-tag">&lt;/</span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-name">a</span></span></span></del><span class="xml"><span class="hljs-tag">&gt;</span></span><span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">32</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;</span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-name">a</span></span></span></del><span class="xml"><span class="hljs-tag"> </span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-attr">href</span>=<span class="hljs-string">"/#/</span></span></span></del><span class="xml"><span class="hljs-tag"><span class="hljs-string">completed"</span>&gt;</span>Completed<span class="hljs-tag">&lt;/</span></span><del><span class="xml"><span class="hljs-tag"><span class="hljs-name">a</span></span></span></del><span class="xml"><span class="hljs-tag">&gt;</span></span><span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">30</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;</span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-name">router-link</span></span></span></ins><span class="xml"><span class="hljs-tag"> </span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-attr">to</span>=<span class="hljs-string">"/"</span></span></span></ins><span class="xml"><span class="hljs-tag"> </span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-attr">exact-active-class</span>=<span class="hljs-string">"selected"</span>&gt;</span></span></ins><span class="xml">All<span class="hljs-tag">&lt;/</span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-name">router-link</span></span></span></ins><span class="xml"><span class="hljs-tag">&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">31</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;</span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-name">router-link</span></span></span></ins><span class="xml"><span class="hljs-tag"> </span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-attr">to</span>=<span class="hljs-string">"/</span></span></span></ins><span class="xml"><span class="hljs-tag"><span class="hljs-string">active</span></span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-string">"</span> <span class="hljs-attr">exact-active-class</span>=<span class="hljs-string">"selected</span></span></span></ins><span class="xml"><span class="hljs-tag"><span class="hljs-string">"</span>&gt;</span>Active<span class="hljs-tag">&lt;/</span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-name">router-link</span></span></span></ins><span class="xml"><span class="hljs-tag">&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">32</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript">                &lt;li&gt;<span class="xml"><span class="hljs-tag">&lt;</span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-name">router-link</span></span></span></ins><span class="xml"><span class="hljs-tag"> </span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-attr">to</span>=<span class="hljs-string">"/</span></span></span></ins><span class="xml"><span class="hljs-tag"><span class="hljs-string">completed</span></span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-string">"</span> <span class="hljs-attr">exact-active-class</span>=<span class="hljs-string">"selected</span></span></span></ins><span class="xml"><span class="hljs-tag"><span class="hljs-string">"</span>&gt;</span>Completed<span class="hljs-tag">&lt;/</span></span><ins><span class="xml"><span class="hljs-tag"><span class="hljs-name">router-link</span></span></span></ins><span class="xml"><span class="hljs-tag">&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">li</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">33</div>
    <div class="line-num2">33</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">            <span class="hljs-section">&lt;/ul&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">34</div>
    <div class="line-num2">34</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-comment">&lt;!-- Hidden if no completed items are left ↓ --&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">35</div>
    <div class="line-num2">35</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn scala">            &lt;button <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"clear-completed"</span> <span class="hljs-meta">@click</span>=<span class="hljs-string">"clearCompleted"</span>&gt;<span class="hljs-type">Clear</span> completed&lt;/button&gt;</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -38,19 +38,14 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">38</div>
    <div class="line-num2">38</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/template&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">39</div>
    <div class="line-num2">39</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">40</div>
    <div class="line-num2">40</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml"><span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">lang</span>=<span class="hljs-string">"ts"</span>&gt;</span><span class="undefined"></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">41</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Vue, Component } <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-property-decorator'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">41</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Vue, Component<ins>,</ins> <ins>Watch </ins>} <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-property-decorator'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">42</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Route } <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-router'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">42</div>
    <div class="line-num2">43</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript"><span class="hljs-keyword">import</span> { Entity, <span class="hljs-built_in">Set</span> } <span class="hljs-keyword">from</span> <span class="hljs-string">'@diaspora/diaspora'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">43</div>
    <div class="line-num2">44</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">45</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { EDisplayMode } <span class="hljs-keyword">from</span> <span class="hljs-string">'../router/EDisplayMode'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">44</div>
    <div class="line-num2">46</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { ToDos, ITodo } <span class="hljs-keyword">from</span> <span class="hljs-string">'../dataStore'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">45</div>
    <div class="line-num2">47</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> TodoItemComponent <span class="hljs-keyword">from</span> <span class="hljs-string">'./TodoItem.vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">46</div>
    <div class="line-num2">48</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">47</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-regexp">//</span> Display modes <span class="hljs-keyword">of</span> the app. It <span class="hljs-keyword">is</span> used to filter ToDos</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">48</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cpp"><span class="hljs-keyword">enum</span> EDisplayMode{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">49</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">FINISHED</span> = <span class="hljs-number">1</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">50</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">UNFINISHED</span> = <span class="hljs-number">2</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">51</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">ALL</span> = EDisplayMode.FINISHED &amp; EDisplayMode.UNFINISHED,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">52</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">53</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">54</div>
    <div class="line-num2">49</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">@<span class="hljs-keyword">Component</span>( {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">55</div>
    <div class="line-num2">50</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">components</span>: { TodoItemComponent },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">56</div>
    <div class="line-num2">51</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">} )</span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -148,6 +143,24 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">148</div>
    <div class="line-num2">143</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.leftTodos = leftTodos.length;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">149</div>
    <div class="line-num2">144</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">150</div>
    <div class="line-num2">145</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">146</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Routing</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">147</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">148</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">    <span class="hljs-regexp">//</span> Current route used <span class="hljs-keyword">by</span> the app. See `<span class="javascript">../router/index.ts</span>`.</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">149</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">public</span> <span class="hljs-variable">$route</span>!: Route;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">150</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">151</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Every time the route change:</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">152</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// * set the `displayMode` property to the one configured on the route</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">153</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// * then refresh the ToDos lists</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">154</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">    @Watch( <span class="hljs-string">'$route'</span> )</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">155</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">private</span> <span class="hljs-keyword">async</span> <span class="hljs-title">onRouteChanged</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">156</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">        <span class="hljs-keyword">if</span> ( this.<span class="hljs-variable">$route</span>.matched &amp;&amp; this.<span class="hljs-variable">$route</span>.matched.length === 1 ){</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">157</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">            <span class="hljs-keyword">const</span> matched = <span class="hljs-keyword">this</span>.$route.matched[<span class="hljs-number">0</span>];</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">158</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cs">            <span class="hljs-keyword">this</span>.displayMode = ( matched.props <span class="hljs-keyword">as</span> {<span class="hljs-keyword">default</span>: {displayMode: EDisplayMode}} ).<span class="hljs-keyword">default</span>.displayMode;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">159</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">160</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.refreshToDoSearches();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">161</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">162</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">163</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">151</div>
    <div class="line-num2">164</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDos creation</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">152</div>
    <div class="line-num2">165</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">153</div>
    <div class="line-num2">166</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Model property that contains the label of the ToDo we are creating</span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -182,7 +195,7 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">182</div>
    <div class="line-num2">195</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Check the documentation'</span>, finished: true },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">183</div>
    <div class="line-num2">196</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Finish the tutorial'</span>, finished: false },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">184</div>
    <div class="line-num2">197</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">        ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">185</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.<del>refreshToDoSearches</del>();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">198</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.<ins>onRouteChanged</ins>();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">186</div>
    <div class="line-num2">199</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">187</div>
    <div class="line-num2">200</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">188</div>
    <div class="line-num2">201</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/script&gt;</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="ts">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/index.ts</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -3,9 +3,11 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">3</div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> Vue <span class="hljs-keyword">from</span> <span class="hljs-string">'vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">4</div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">5</div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> AppComponent <span class="hljs-keyword">from</span> <span class="hljs-string">'./components/App.vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> router <span class="hljs-keyword">from</span> <span class="hljs-string">'./router'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">6</div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">7</div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">Vue.config.productionTip = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">8</div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">new</span> Vue( {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">9</div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    el: <span class="hljs-string">'#app'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    router,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">10</div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">components</span>: { AppComponent },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">11</div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">} );</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="ts">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/router/EDisplayMode.ts</span>
        <span class="d2h-tag d2h-added d2h-added-tag">ADDED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -0,0 +1,6 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-regexp">//</span> Display modes <span class="hljs-keyword">of</span> the app. It <span class="hljs-keyword">is</span> used to filter ToDos</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp"><span class="hljs-keyword">export</span> <span class="hljs-keyword">enum</span> EDisplayMode{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">FINISHED</span> = <span class="hljs-number">1</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">UNFINISHED</span> = <span class="hljs-number">2</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">ALL</span> = EDisplayMode.FINISHED &amp; EDisplayMode.UNFINISHED,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="ts">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/router/index.ts</span>
        <span class="d2h-tag d2h-added d2h-added-tag">ADDED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -0,0 +1,30 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> Vue <span class="hljs-keyword">from</span> <span class="hljs-string">'vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> Router <span class="hljs-keyword">from</span> <span class="hljs-string">'vue-router'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { EDisplayMode } <span class="hljs-keyword">from</span> <span class="hljs-string">'./EDisplayMode'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> AppComponent <span class="hljs-keyword">from</span> <span class="hljs-string">'../components/App.vue'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css"><span class="hljs-selector-tag">Vue</span><span class="hljs-selector-class">.use</span>( <span class="hljs-selector-tag">Router</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">export</span> <span class="hljs-keyword">default</span> <span class="hljs-keyword">new</span> Router( {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">routes</span>: [</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            path: <span class="hljs-string">'/'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            name: <span class="hljs-string">'index'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">            <span class="hljs-attribute">component</span>: AppComponent,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">15</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            <span class="hljs-selector-tag">props</span>: { <span class="hljs-attribute">default</span>: true, displayMode: EDisplayMode.ALL },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">16</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">17</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">18</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            path: <span class="hljs-string">'/completed'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">19</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            name: <span class="hljs-string">'completed'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">20</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">            <span class="hljs-attribute">component</span>: AppComponent,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">21</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            <span class="hljs-selector-tag">props</span>: { <span class="hljs-attribute">default</span>: true, displayMode: EDisplayMode.FINISHED },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">22</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">23</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">24</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            path: <span class="hljs-string">'/active'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">25</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">            name: <span class="hljs-string">'active'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">26</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">            <span class="hljs-attribute">component</span>: AppComponent,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">27</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn css">            <span class="hljs-selector-tag">props</span>: { <span class="hljs-attribute">default</span>: true, displayMode: EDisplayMode.UNFINISHED },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">28</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">        },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">29</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    ],</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">30</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">} );</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

### Remove test data, change data source and other quick modifications ([commit](!https://github.com/diaspora-orm/simple-todo-app/commit/c3e0994d5f894b867c252942602c2ae473ab57eb))

This is our final action on this app ! Here is what we still need to do:

* Remove the test data in the **AppComponent**'s *mounted* method,
* Add the focus on the label edition input when starting the edit,
* Change the data source from an *in-memory adapter* to a *web-storage adapter* (that use *localStorage*)
* Rename the model to `todos-diaspora` to match the specs.

<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/App.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -189,12 +189,8 @@ export default class AppComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">189</div>
    <div class="line-num2">189</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">190</div>
    <div class="line-num2">190</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Initialization</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">191</div>
    <div class="line-num2">191</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">192</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// </span><del><span class="hljs-comment">When</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">starting</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">up</span></del><span class="hljs-comment"> the app</span><del><span class="hljs-comment">,</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">insert</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">fake</span></del><span class="hljs-comment"> </span><del><span class="hljs-comment">data</span></del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">192</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// </span><ins><span class="hljs-comment">Once</span></ins><span class="hljs-comment"> </span><ins><span class="hljs-comment">the</span></ins><span class="hljs-comment"> </span><ins><span class="hljs-comment">component</span></ins><span class="hljs-comment"> </span><ins><span class="hljs-comment">is mounted (and thus, </span></ins><span class="hljs-comment">the app </span><ins><span class="hljs-comment">is</span></ins><span class="hljs-comment"> </span><ins><span class="hljs-comment">ready),</span></ins><span class="hljs-comment"> </span><ins><span class="hljs-comment">apply the current route.</span></ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">193</div>
    <div class="line-num2">193</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cs">    <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">async</span> <span class="hljs-title">mounted</span>(<span class="hljs-params"></span>)</span>{</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">194</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> ToDos.insertMany( [</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">195</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Check the documentation'</span>, finished: true },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">196</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn css">            { <span class="hljs-attribute">label</span>: <span class="hljs-string">'Finish the tutorial'</span>, finished: false },</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">197</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn">        ] );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">198</div>
    <div class="line-num2">194</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">await</span> <span class="hljs-keyword">this</span>.onRouteChanged();</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">199</div>
    <div class="line-num2">195</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">200</div>
    <div class="line-num2">196</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="vue">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/components/TodoItem.vue</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -8,7 +8,7 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">8</div>
    <div class="line-num2">8</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn xml">            <span class="hljs-tag">&lt;<span class="hljs-name">label</span> @<span class="hljs-attr">dblclick</span>=<span class="hljs-string">"startEdit"</span>&gt;</span>{{label}}<span class="hljs-tag">&lt;/<span class="hljs-name">label</span>&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">9</div>
    <div class="line-num2">9</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn javascript">            &lt;button <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"destroy"</span> @click=<span class="hljs-string">"removeTodo"</span>&gt;<span class="xml"><span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">10</div>
    <div class="line-num2">10</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">        <span class="hljs-section">&lt;/div&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">11</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn java">        &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"edit"</span> v-model=<span class="hljs-string">"editedLabel"</span> <span class="hljs-meta">@blur</span>=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.enter=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.esc=<span class="hljs-string">"discardEdit"</span> <del>/&gt;</del></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn java">        &lt;input <span class="hljs-class"><span class="hljs-keyword">class</span></span>=<span class="hljs-string">"edit"</span> v-model=<span class="hljs-string">"editedLabel"</span> <span class="hljs-meta">@blur</span>=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.enter=<span class="hljs-string">"saveEdit"</span> <span class="hljs-meta">@keyup</span>.esc=<span class="hljs-string">"discardEdit"</span> <ins>ref=<span class="hljs-string">"labelEdit"</span>&gt;</ins></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">12</div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache">    <span class="hljs-section">&lt;/li&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">13</div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn apache"><span class="hljs-section">&lt;/template&gt;</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">14</div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -42,6 +42,12 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">42</div>
    <div class="line-num2">42</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> isEditing = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">43</div>
    <div class="line-num2">43</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-keyword">public</span> isHovered = <span class="hljs-literal">false</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">44</div>
    <div class="line-num2">44</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">45</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># Component's DOM references. </span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">46</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Keep a reference to the `editedLabel` input that will be focused on edit</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">47</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn nginx">    <span class="hljs-attribute">public</span> <span class="hljs-variable">$refs</span>!: {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">48</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn http">        <span class="hljs-attribute">labelEdit</span>: HTMLInputElement;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">49</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn">    };</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">50</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">45</div>
    <div class="line-num2">51</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">46</div>
    <div class="line-num2">52</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    // <span class="hljs-comment"># ToDo edition</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">47</div>
    <div class="line-num2">53</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    </span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -80,6 +86,9 @@ export default class TodoItemComponent extends Vue {</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">80</div>
    <div class="line-num2">86</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">        }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">81</div>
    <div class="line-num2">87</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.isEditing = <span class="hljs-literal">true</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">82</div>
    <div class="line-num2">88</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-keyword">this</span>.editedLabel = <span class="hljs-keyword">this</span>.todo.attributes.label;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">89</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        <span class="hljs-regexp">//</span> Defer to next tick, to let vuejs update the <span class="hljs-class"><span class="hljs-keyword">class</span></span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">90</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn cpp">        <span class="hljs-comment">// and display the input before focusing the input</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">91</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn coffeescript">        setTimeout( <span class="hljs-function"><span class="hljs-params">()</span> =&gt;</span> <span class="hljs-keyword">this</span>.$refs.labelEdit.focus(), <span class="hljs-number">0</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">83</div>
    <div class="line-num2">92</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">    }</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">84</div>
    <div class="line-num2">93</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">85</div>
    <div class="line-num2">94</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp">    <span class="hljs-comment">// Exit the edit mode, set the ToDo label with the edited one &amp; persist the entity in data store</span></span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="d2h-file-wrapper" aria-hidden="true" data-lang="ts">
    <div class="d2h-file-header">
        <span class="d2h-file-name-wrapper">
        <span class="d2h-icon-wrapper"><svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">
        <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>
    </svg></span>
        <span class="d2h-file-name">src/dataStore.ts</span>
        <span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span></span>
        </div>
        <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                    <tbody class="d2h-diff-tbody">
                    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -1,7 +1,7 @@</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">1</div>
    <div class="line-num2">1</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn coffeescript"><span class="hljs-keyword">import</span> { Diaspora, EFieldType } <span class="hljs-keyword">from</span> <span class="hljs-string">'@diaspora/diaspora'</span>;</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">2</div>
    <div class="line-num2">2</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">3</div>
    <div class="line-num2">3</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Initialize the data source</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">4</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn bash">Diaspora.createNamedDataSource( <span class="hljs-string">'main'</span>, <span class="hljs-string">'</span><del><span class="hljs-string">inMemory</span></del><span class="hljs-string">'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">4</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn bash">Diaspora.createNamedDataSource( <span class="hljs-string">'main'</span>, <span class="hljs-string">'</span><ins><span class="hljs-string">webStorage</span></ins><span class="hljs-string">'</span> );</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">5</div>
    <div class="line-num2">5</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">6</div>
    <div class="line-num2">6</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Interface describing the attributes of a ToDo item.</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">7</div>
    <div class="line-num2">7</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Because the ID is a property of the Entity, we don't declare it here.</span></span></div>
        </td>
    </tr>
    <tr>
        <td class="d2h-code-linenumber d2h-info"></td>
        <td class="d2h-info">
            <div class="d2h-code-line d2h-info">@@ -11,7 +11,7 @@ export interface ITodo{</div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">11</div>
    <div class="line-num2">11</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn">}</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">12</div>
    <div class="line-num2">12</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">13</div>
    <div class="line-num2">13</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn cpp"><span class="hljs-comment">// Define &amp; export the Model</span></span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-del">
        <div class="line-num1">14</div>
    <div class="line-num2"></div>
        </td>
        <td class="d2h-del hljs">
            <div class="d2h-code-line d2h-del"><span class="d2h-code-line-prefix">-</span><span class="d2h-code-line-ctn javascript"><span class="hljs-keyword">export</span> <span class="hljs-keyword">const</span> ToDos = Diaspora.declareModel&lt;ITodo&gt;( <span class="hljs-string">'</span><del><span class="hljs-string">ToDos</span></del><span class="hljs-string">'</span>, {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-ins">
        <div class="line-num1"></div>
    <div class="line-num2">14</div>
        </td>
        <td class="d2h-ins hljs">
            <div class="d2h-code-line d2h-ins"><span class="d2h-code-line-prefix">+</span><span class="d2h-code-line-ctn javascript"><span class="hljs-keyword">export</span> <span class="hljs-keyword">const</span> ToDos = Diaspora.declareModel&lt;ITodo&gt;( <span class="hljs-string">'</span><ins><span class="hljs-string">todo-diaspora</span></ins><span class="hljs-string">'</span>, {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">15</div>
    <div class="line-num2">15</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn bash">    sources: <span class="hljs-string">'main'</span>,</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">16</div>
    <div class="line-num2">16</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">    <span class="hljs-attribute">attributes</span>: {</span></div>
        </td>
    </tr><tr>
        <td class="d2h-code-linenumber d2h-cntx">
        <div class="line-num1">17</div>
    <div class="line-num2">17</div>
        </td>
        <td class="d2h-cntx hljs">
            <div class="d2h-code-line d2h-cntx"><span class="d2h-code-line-prefix"> </span><span class="d2h-code-line-ctn http">        <span class="hljs-attribute">label</span>: {</span></div>
        </td>
    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

---

We are done. As you have seen in this tutorial, Diaspora allows many ways to interact with data, by using **models** or **entities**, and facilitates development by switching the data source with a single instruction change on `Diaspora.declareNamedDataSource`.

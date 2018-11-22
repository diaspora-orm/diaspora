## Introduction

Because Diaspora is built for both the server & the browser, it opens some great possibilities. The concept of adapters define standard ways to interract with our data, wherever it comes from, and others Diaspora ecosystem modules may help to gain some time.

In this tutorial, we are going to build the same simple *ToDo* app than we did in the [ToDo app tutorial](/tutorials/simple-todo-app), with a slight difference: the data will be stored remotely on the server. We are not going to implement users authentication or user store, and we'll simply rely on the **express** session id. I'll consider for the next steps of this tutorial that you have already the [Simple ToDo app](/tutorials/simple-todo-app) working.

For the **back-end**, on the **server**, we'll need a store to persist all the datas of all users. We'll also need to set up an API to exchange our *ToDos* with the client. Finally, on the **front-end**, on the **client's browser**, we'll need a way to retrieve or send datas to our API.

This seems to be a lot of work, but Diaspora is here to help. The Diaspora's [server plugin]() makes it easy to generate **APIs**, & the WebAPI *adapter* allows you to use **internet endpoints** as *data providers*. Combining those modules will make it very easy, concise & reliable to do such common setup.

## Configuring the server API


# API documentation

Welcome on the API documentation of Diaspora.

## <a href="#modules-architecture" id="modules-architecture">Modules architecture</a>

For now, modules are divided in 3 categories:

1. Extensions
2. Functionnal modules
3. Terminal modules

An application (like a full website) is a set of [Terminal modules]() that defines each a feature.

### <a href="#extensions" id="extensions">Extensions</a>

Extension modules define convinient ways to extend every dependant modules. An extension links a module's key with its handling function with the [extendModule](module-AltCore.AltCore.html#.extendModule__anchor) method of [AltCore]().

They can use both [Extensions](#extensions) and [Functionnal modules](#functionnal-modules), and are meant to define generic logic

### <a href="#functionnal-modules" id="functionnal-modules">Functionnal modules</a>

Functionnal modules bring new features to its children by defining APIs. Functionnal modules are almost the same as extension, except that they do not use [extendModule](module-AltCore.AltCore.html#.extendModule__anchor).

They can use both [Extensions](#extensions) and [Functionnal modules](#functionnal-modules), and are meant to define generic logic

### <a href="#terminal-modules" id="terminal-modules">Terminal modules</a>

Terminal modules are the only types of modules that can contain specific logic. When you want to start an app feature, you usually do a [loadModule](module-AltCore.AltCore.html#.loadModule__anchor) with the appropriate [Terminal Module](#terminal-modules) that will include its dependencies.

They can use [Extensions](#extensions), [Functionnal modules](#functionnal-modules) and other [Terminal modules](#terminal-modules).
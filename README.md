# Diaspora

***Multi-source ORM for NodeJS & the browser***

---

## API

### Model methods

* **make/spawn([*object* `props`]) => *Instance***: Crée une instance, définissant ses propriétés  paramètres `props` fournis. Cette instance doit être persistée manuellement par la suite
* **makeMany/spawnMany([*object[]* `props`]) => *Instance***: Crée des instances, définissant ses propriétés  paramètres `props` fournis. Cette instance doit être persistée manuellement par la suite
* **find(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Instance)***: Récupère une entité correspondant à `query` avec les options fournies. Si `query` n'est pas un objet, on considère qu'il s'agit de l'ID.
* **findMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Instance[])***: cf `find`
* **delete(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Instance)***: Supprime une entité correspondant à `query`. Si `query` n'est pas un objet, on considère qu'il s'agit de l'ID. `options` peut contenir `allowEmptyQuery`. L'instance renvoyée a pour valeurs temporaire des valeurs indéfinies.
* **deleteMany(*object || Any* `query`, [*object* `options`], [*string* `source`]) => *Promise(Instance)***: cf `delete`
* **update(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Instance)***: Met à jour une entité correspondant à `query` avec les attributs contenus dans `newAttrs`. Si `query` n'est pas un objet, on considère qu'il s'agit de l'ID. `options` peut contenir `allowEmptyQuery`.
* **updateMany(*object || Any* `query`, *object* `newAttrs`, [*object* `options`], [*string* `source`]) => *Promise(Instance[])***: cf `update`

### Entity methods

* **destroy([*string* `source`]) => *Promise(Instance)***: Supprime cette instance de la `source` spécifiée. Ses propriétés temporaires/instantanées sont réinitialisées à `undefined`.
* **persist([*string* `source`]) => *Promise(Instance)***: Enregistre les modifications de cette instance dans `source` spécifiée. Ses propriétés temporaires/instantanées sont définies à celles renvoyées par l'adapteur.
* **fetch([*string* `source`]) => *Promise(Instance)***: Réeffectue les opérations nécessaires pour obtenir l'état de l'instance dans la source spécifiée.
	
## Planned or unsure Diaspora behaviors

> Manual change of ID

Entity may change mode to `desync` ?

> Adapter peer-to-peer

May be interesting...
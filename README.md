# Acl

Licence: [MIT](https://opensource.org/licenses/MIT)

---

[![npm version](https://badge.fury.io/js/%40superhero%2Facl.svg)](https://badge.fury.io/js/%40superhero%2Facl)

ACL - Access Control List

## Install

`npm install @superhero/acl`

...or just set the dependency in your `package.json` file:

```json
{
  "dependencies":
  {
    "@superhero/acl": "*"
  }
}
```

## Example | Role

```js
const
Acl         = require('@superhero/acl'),
acl         = new Acl,
role        = 'foo',
domain      = 'bar',
resource    = 'baz',
permission  = 'qux'

acl.addRoleResourcePermission(role, domain, resource, permission)
const authorized = acl.isRoleAuthorized(role, domain, resource, permission)
// authorized == true
```

## Example | User

```js
const
Acl         = require('@superhero/acl'),
acl         = new Acl,
user        = 'foobar',
role        = 'bazbar',
domain      = 'barbaz',
resource    = 'bazqux',
permission  = 'quxfoo'

acl.addRoleUser(role, user)
acl.addRoleResourcePermission(role, domain, resource, permission)
const authorized = acl.isUserAuthorized(user, domain, resource, permission)
// authorized == true
```

## Example | Dump and re-create an ACL

```js
const
AclFactory  = require('@superhero/acl/factory'),
aclFactory  = new AclFactory,
acl_genesis = aclFactory.create(),
role        = 'foo',
domain      = 'bar',
resource    = 'baz',
permission  = 'qux'

acl_genesis.addRoleResourcePermission(role, domain, resource, permission)

const
dump        = acl_genesis.dump(),
acl         = aclFactory.create(dump),
authorized  = acl.isRoleAuthorized(role, domain, resource, permission)
// authorized == true
```

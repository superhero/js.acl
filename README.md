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

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
resource    = 'bar',
permission  = 'baz'

acl.addRoleResourcePermission(role, resource, permission)
const authorized = acl.isRoleAuthorized(role, resource, permission)
// authorized == true
```

## Example | User

```js
const
acl         = new Acl,
user        = 'foo',
role        = 'bar',
resource    = 'baz',
permission  = 'qux'

acl.addRoleUser(role, user)
acl.addRoleResourcePermission(role, resource, permission)
const authorized = acl.isUserAuthorized(user, resource, permission)
// authorized == true
```

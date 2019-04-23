const
InvalidArgKeyError  = require('./error/invalid-arg-key'),
Acl                 = require('..')

class AclFactory
{
  create(roles)
  {
    const acl = new Acl

    if(roles)
      for(const role in roles)
        for(const key in roles[role])
          this.populateAcl(key, acl, roles, role)

    return acl
  }

  populateAcl(key, acl, roles, role)
  {
    switch(key)
    {
      case 'users':
      {
        this.populateAclUsers(acl, roles, role)
        break
      }
      case 'children':
      {
        this.populateAclChildren(acl, roles, role)
        break
      }
      case 'domains':
      {
        this.populateAclDomains(acl, roles, role)
        break
      }
      default:
      {
        throw new InvalidArgKeyError(`unknown key:"${key}"`)
      }
    }
  }

  populateAclUsers(acl, roles, role)
  {
    for(const user of roles[role].users)
      acl.addRoleUser(role, user)
  }

  populateAclChildren(acl, roles, role)
  {
    for(const child of roles[role].children)
      acl.addRoleChild(role, child)
  }

  populateAclDomains(acl, roles, role)
  {
    if(roles[role].domains)
      for(const domain in roles[role].domains)
      {
        acl.addRoleDomain(role, domain)

        for(const resource in roles[role].domains[domain])
        {
          acl.addRoleDomainResource(role, domain, resource)

          const
          _reference  = roles[role].domains[domain][resource],
          permissions = Array.isArray(_reference)
          ?  _reference
          : [_reference]

          for(const permission of permissions)
            acl.addRoleDomainResourcePermission(role, domain, resource, permission)
        }
      }
  }
}

module.exports = AclFactory

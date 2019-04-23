class Acl
{
  constructor()
  {
    this.roles = {}
  }

  hasRole(role)
  {
    return role in this.roles
  }

  addRole(role)
  {
    if(!this.hasRole(role))
      this.roles[role] =
      {
        users     : [],
        children  : [],
        domains   : {}
      }
  }

  removeRole(role)
  {
    delete this.roles[role]

    for(const role in this.roles)
      this.removeRoleChild(role, child)
  }

  hasRoleChild(role, child)
  {
    return this.hasRole(role)
        && this.roles[role].children.includes(child)
  }

  hasRoleChildRecursively(role, child)
  {
    if(this.hasRoleChild(role, child))
      return true

    if(this.hasRole(role))
      for(const roleChild of this.roles[role].children)
        if(this.hasRoleChildRecursively(roleChild, child))
          return true

    return false
  }

  addRoleChild(role, child)
  {
    this.addRole(child)
    this.addRole(role)

    if(!this.hasRoleChildRecursively(child, role))
      this.roles[role].children.push(child)
  }

  removeRoleChild(role, child)
  {
    if(this.hasRole(role))
    {
      const i = this.roles[role].children.indexOf(child)
      ~i && this.roles[role].children.splice(i, 1)
    }
  }

  hasRoleUser(role, user)
  {
    return this.hasRole(role)
        && this.roles[role].users.includes(user)
  }

  addRoleUser(role, user)
  {
    this.addRole(role)

    if(!this.hasRoleUser(role, user))
      this.roles[role].users.push(user)
  }

  removeRoleUser(role, user)
  {
    if(this.hasRole(role))
    {
      const i = this.roles[role].users.indexOf(user)
      ~i && this.roles[role].users.splice(i, 1)
    }
  }

  removeUser(user)
  {
    for(const role in this.roles)
      this.removeRoleUser(role, user)
  }

  hasRoleDomain(role, domain)
  {
    return this.hasRole(role)
        && domain in this.roles[role].domains
  }

  hasRoleDomainResource(role, domain, resource)
  {
    return this.hasRoleDomain(role, domain)
        && resource in this.roles[role].domains[domain]
  }

  hasRoleDomainResourcePermission(role, domain, resource, permission)
  {
    return this.hasRoleDomainResource(role, domain, resource)
        && this.roles[role].domains[domain][resource].includes(permission)
  }

  removeRoleDomain(role, domain)
  {
    if(this.hasRole(role))
      delete this.roles[role].domains[domain]
  }

  removeRoleDomainResource(role, domain, resource)
  {
    if(this.hasRoleDomain(role, domain))
      delete this.roles[role].domains[domain][resource]
  }

  removeDomain(domain)
  {
    for(const role in this.roles)
      this.removeRoleDomain(role, domain)
  }

  removeDomainResource(domain, resource)
  {
    for(const role in this.roles)
      this.removeRoleDomainResource(role, domain, resource)
  }

  addRoleDomain(role, domain)
  {
    this.addRole(role)

    if(!this.hasRoleDomain(role, domain))
      this.roles[role].domains[domain] = {}
  }

  addRoleDomainResource(role, domain, resource)
  {
    this.addRoleDomain(role, domain)

    if(!this.hasRoleDomainResource(role, domain))
      this.roles[role].domains[domain][resource] = []
  }

  addRoleDomainResourcePermission(role, domain, resource, permission)
  {
    this.addRoleDomainResource(role, domain, resource)

    if(!this.hasRoleDomainResourcePermission(role, domain, resource, permission))
      permission && this.roles[role].domains[domain][resource].push(permission)
  }

  removeRoleDomainResourcePermission(role, domain, resource, permission)
  {
    if(this.hasRoleDomainResource(role, domain, resource))
    {
      const i = this.roles[role].domains[domain][resource].indexOf(permission)
      ~i && this.roles[role].domains[domain][resource].splice(i, 1)
    }
  }

  removeDomainResourcePermission(domain, resource, permission)
  {
    for(const role in this.roles)
      this.removeRoleDomainResourcePermission(role, domain, resource, permission)
  }

  getUserRoles(user)
  {
    const roles = []

    for(const role in this.roles)
      if(this.hasRoleUser(role, user))
        roles.push(role)

    return roles
  }

  getUserRolesRecursively(user)
  {
    const
    roles = [],
    chain = (role) =>
    {
      for(const roleChild of this.roles[role].children)
        if(this.hasRole(roleChild) && !roles.includes(roleChild))
        {
          roles.push(roleChild)
          chain(roleChild)
        }
    }

    for(const role in this.roles)
      if(this.hasRoleUser(role, user))
      {
        roles.push(role)
        chain(role)
      }

    return roles
  }

  getRolesRecursively(role)
  {
    const
    roles = [],
    chain = (role) =>
    {
      for(const roleChild of this.roles[role].children)
        if(this.hasRole(roleChild) && !roles.includes(roleChild))
        {
          roles.push(roleChild)
          chain(roleChild)
        }
    }

    if(this.hasRole(role))
    {
      roles.push(role)
      chain(role)
    }

    return roles
  }

  isUserAuthorized(user, domain, resource, permission)
  {
    const roles = this.getUserRoles(user)

    for(const role of roles)
      if(this.isRoleAuthorized(role, domain, resource, permission))
        return true

    return false
  }

  isRoleAuthorized(role, domain, resource, permission)
  {
    const roles = this.getRolesRecursively(role)

    if(permission)
    {
      for(const role of roles)
        if(this.hasRoleDomainResourcePermission(role, domain, resource, permission)
        || this.hasRoleDomainResourcePermission(role, '*', resource, permission)
        || this.hasRoleDomainResourcePermission(role, domain, '*', permission)
        || this.hasRoleDomainResourcePermission(role, domain, resource, '*')
        || this.hasRoleDomainResourcePermission(role, '*', '*', permission)
        || this.hasRoleDomainResourcePermission(role, '*', resource, '*')
        || this.hasRoleDomainResourcePermission(role, domain, '*', '*')
        || this.hasRoleDomainResourcePermission(role, '*', '*', '*')
        || this.hasRoleDomainResourcePermission('*', domain, resource, permission)
        || this.hasRoleDomainResourcePermission('*', '*', resource, permission)
        || this.hasRoleDomainResourcePermission('*', domain, '*', permission)
        || this.hasRoleDomainResourcePermission('*', domain, resource, '*')
        || this.hasRoleDomainResourcePermission('*', '*', '*', permission)
        || this.hasRoleDomainResourcePermission('*', '*', resource, '*')
        || this.hasRoleDomainResourcePermission('*', domain, '*', '*')
        || this.hasRoleDomainResourcePermission('*', '*', '*', '*'))
          return true
    }
    else
    {
      for(const role of roles)
        if(this.hasRoleDomainResource(role, domain, resource)
        || this.hasRoleDomainResource(role, '*', resource)
        || this.hasRoleDomainResource(role, domain, '*')
        || this.hasRoleDomainResource(role, '*', '*')
        || this.hasRoleDomainResource('*', domain, resource)
        || this.hasRoleDomainResource('*', '*', resource)
        || this.hasRoleDomainResource('*', domain, '*')
        || this.hasRoleDomainResource('*', '*', '*'))
          return true
    }

    return false
  }

  dump()
  {
    return JSON.parse(JSON.stringify(this.roles))
  }
}

module.exports = Acl

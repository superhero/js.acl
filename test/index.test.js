describe('acl', () =>
{
  const
  expect      = require('chai').expect,
  context     = require('mochawesome/addContext'),
  Acl         = require('..'),
  AclFactory  = require('../factory'),
  aclFactory  = new AclFactory

  describe('can create an acl from roles', () =>
  {
    it('should be able to create an instance from a configured json', function()
    {
      const acl = new Acl
      acl.addRoleUser('foo', 'foobar')
      acl.addRoleUser('foo', 'bazqux')
      acl.addRoleUser('bar', 'foobaz')
      acl.addRoleChild('bar', 'foo')
      acl.addRoleChild('bar', 'baz')
      acl.addRoleDomainResource('baz', 'domain', 'res-0')
      acl.addRoleDomainResourcePermission('foo', 'domain', 'res-1', 'perm-1-1')
      acl.addRoleDomainResourcePermission('foo', 'domain', 'res-2', 'perm-2-1')
      acl.addRoleDomainResourcePermission('foo', 'domain', 'res-2', 'perm-2-2')
      acl.addRoleDomainResourcePermission('baz', 'domain', 'res-1', 'perm-1-1')
      acl.addRoleDomainResourcePermission('baz', 'domain', 'res-1', 'perm-1-2')
      acl.addRoleDomainResourcePermission('baz', 'domain', 'res-1', 'perm-1-3')
      const dump = acl.dump()
      context(this, { title:'dump', value:dump })
      expect(aclFactory.create(dump).roles).to.deep.equal(acl.roles)
    })

    it('should throw an error if there is an invalid key in the arg',
    () => expect(aclFactory.create.bind(aclFactory, { foo:{ bar:'baz' } })).to.throw(Error))
  })

  describe('hasRole(role)', () =>
  {
    it('should not find a role not previously added', () =>
    {
      const
      acl   = new Acl,
      role  = 'role'
      expect(acl.hasRole(role)).to.be.equal(false)
    })

    it('should be able to find an existing role', () =>
    {
      const
      acl   = new Acl,
      role  = 'role'
      expect(acl.hasRole(role)).to.be.equal(false)
      acl.addRole(role)
      expect(acl.hasRole(role)).to.be.equal(true)
    })
  })

  describe('addRole(role)', () =>
  {
    it('should be able to add a role', () =>
    {
      const
      acl   = new Acl,
      role  = 'role'
      expect(acl.hasRole(role)).to.be.equal(false)
      acl.addRole(role)
      expect(acl.hasRole(role)).to.be.equal(true)
    })

    it('adding the same role multiple times wont reset it', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      user  = 'bar'
      acl.addRole(role)
      acl.addRoleUser(role, user)
      acl.addRole(role)
      expect(acl.hasRoleUser(role, user)).to.be.equal(true)
    })
  })

  describe('removeRole(role)', () =>
  {
    it('removing a non existing role wont throw', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo'
      expect(acl.removeRole.bind(acl, role)).to.not.throw()
    })

    it('removing an existing role to be removed', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo'
      acl.addRole(role)
      expect(acl.hasRole(role)).to.be.equal(true)
      acl.removeRole(role)
      expect(acl.hasRole(role)).to.be.equal(false)
    })
  })

  describe('hasRoleChild(role, child)', () =>
  {
    it('should return false if child is not child of role', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      child = 'bar'
      expect(acl.hasRoleChild(role, child)).to.be.equal(false)
      acl.addRole(role)
      expect(acl.hasRoleChild(role, child)).to.be.equal(false)
      acl.addRole(child)
      expect(acl.hasRoleChild(role, child)).to.be.equal(false)
    })

    it('should be able to find a child of a role', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      child = 'bar'
      acl.addRoleChild(role, child)
      expect(acl.hasRoleChild(role, child)).to.be.equal(true)
    })
  })

  describe('hasRoleChildRecursively(role, child)', () =>
  {
    it('should return false if child does not derive from role', () =>
    {
      const
      acl           = new Acl,
      role          = 'foo',
      child         = 'bar',
      childOfChild  = 'baz'
      expect(acl.hasRoleChildRecursively(role, childOfChild)).to.be.equal(false)
      acl.addRole(role)
      expect(acl.hasRoleChildRecursively(role, childOfChild)).to.be.equal(false)
      acl.addRole(child)
      expect(acl.hasRoleChildRecursively(role, childOfChild)).to.be.equal(false)
      acl.addRole(childOfChild)
      expect(acl.hasRoleChildRecursively(role, childOfChild)).to.be.equal(false)
      acl.addRoleChild(role, child)
      expect(acl.hasRoleChildRecursively(role, childOfChild)).to.be.equal(false)
    })

    it('should return true if child derives from role', () =>
    {
      const
      acl           = new Acl,
      role          = 'foo',
      child         = 'bar',
      childOfChild  = 'baz'
      acl.addRoleChild(role, child)
      acl.addRoleChild(child, childOfChild)
      expect(acl.hasRoleChildRecursively(role, childOfChild)).to.be.equal(true)
    })
  })

  describe('addRoleChild(role, child)', () =>
  {
    it('should be able to add a child to a role', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      child = 'bar'
      acl.addRoleChild(role, child)
      expect(acl.hasRole(role)).to.be.equal(true)
      expect(acl.hasRole(child)).to.be.equal(true)
      expect(acl.hasRoleChild(role, child)).to.be.equal(true)
    })
  })

  describe('removeRoleChild(role, child)', () =>
  {
    it('should be able to remove a child from a role', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      child = 'bar'
      acl.addRoleChild(role, child)
      expect(acl.hasRoleChild(role, child)).to.be.equal(true)
      acl.removeRoleChild(role, child)
      expect(acl.hasRoleChild(role, child)).to.be.equal(false)
    })
  })

  describe('hasRoleUser(role, user)', () =>
  {
    it('should return true only if role has user', () =>
    {
      const
      acl  = new Acl,
      role = 'foo',
      user = 'bar'
      expect(acl.hasRoleUser(role, user)).to.be.equal(false)
      acl.addRole(role)
      expect(acl.hasRoleUser(role, user)).to.be.equal(false)
      acl.addRoleUser(role, user)
      expect(acl.hasRoleUser(role, user)).to.be.equal(true)
    })
  })

  describe('addRoleUser(role user)', () =>
  {
    it('adding a user to a role also creates the role', () =>
    {
      const
      acl  = new Acl,
      role = 'foo',
      user = 'bar'
      expect(acl.hasRole(role)).to.be.equal(false)
      acl.addRoleUser(role, user)
      expect(acl.hasRole(role)).to.be.equal(true)
    })

    it('should be able to add a user to a role', () =>
    {
      const
      acl  = new Acl,
      role = 'foo',
      user = 'bar'
      expect(acl.hasRoleUser(role, user)).to.be.equal(false)
      acl.addRoleUser(role, user)
      expect(acl.hasRoleUser(role, user)).to.be.equal(true)
    })
  })

  describe('removeRoleUser(role, user)', () =>
  {
    it('should be able to remove a user from a role', () =>
    {
      const
      acl  = new Acl,
      role = 'foo',
      user = 'bar'
      expect(acl.hasRoleUser(role, user)).to.be.equal(false)
      acl.addRoleUser(role, user)
      expect(acl.hasRoleUser(role, user)).to.be.equal(true)
      acl.removeRoleUser(role, user)
      expect(acl.hasRoleUser(role, user)).to.be.equal(false)
    })
  })

  describe('removeUser(user)', () =>
  {
    it('should be able to remove a user from all roles', () =>
    {
      const
      acl   = new Acl,
      role1 = 'foo',
      role2 = 'bar',
      role3 = 'baz',
      user  = 'qux'
      acl.addRoleUser(role1, user)
      acl.addRoleUser(role2, user)
      expect(acl.hasRoleUser(role1, user)).to.be.equal(true)
      expect(acl.hasRoleUser(role2, user)).to.be.equal(true)
      expect(acl.hasRoleUser(role3, user)).to.be.equal(false)
      acl.removeUser(user)
      expect(acl.hasRoleUser(role1, user)).to.be.equal(false)
      expect(acl.hasRoleUser(role2, user)).to.be.equal(false)
      expect(acl.hasRoleUser(role3, user)).to.be.equal(false)
    })
  })

  describe('hasRoleDomainResource(role, domain, resource)', () =>
  {
    it('should return true only if the role has the resource', () =>
    {
      const
      acl       = new Acl,
      role      = 'foo',
      resource  = 'bar'
      expect(acl.hasRoleDomainResource(role, 'domain', resource)).to.be.equal(false)
      acl.addRole(role)
      expect(acl.hasRoleDomainResource(role, 'domain', resource)).to.be.equal(false)
      acl.addRoleDomainResource(role, 'domain', resource)
      expect(acl.hasRoleDomainResource(role, 'domain', resource)).to.be.equal(true)
    })
  })

  describe('addRoleDomainResource(role, domain, resource)', () =>
  {
    it('should be able to add a resource to a role', () =>
    {
      const
      acl       = new Acl,
      role      = 'foo',
      resource  = 'bar'
      expect(acl.hasRoleDomainResource(role, 'domain', resource)).to.be.equal(false)
      acl.addRoleDomainResource(role, 'domain', resource)
      expect(acl.hasRoleDomainResource(role, 'domain', resource)).to.be.equal(true)
    })
  })

  describe('removeRoleDomainResource(role, domain, resource)', () =>
  {
    it('should be able to remove a resource from a role', () =>
    {
      const
      acl       = new Acl,
      role      = 'foo',
      domain    = 'domain',
      resource  = 'bar'
      expect(acl.hasRoleDomainResource(role, domain, resource)).to.be.equal(false)
      acl.addRoleDomainResource(role, domain, resource)
      expect(acl.hasRoleDomainResource(role, domain, resource)).to.be.equal(true)
      acl.removeRoleDomainResource(role, domain, resource)
      expect(acl.hasRoleDomainResource(role, domain, resource)).to.be.equal(false)
    })

    it('removing a resource from a role should not remove the role', () =>
    {
      const
      acl       = new Acl,
      role      = 'foo',
      resource  = 'bar'
      acl.addRoleDomainResource(role, 'domain', resource)
      acl.removeRoleDomainResource(role, 'domain', resource)
      expect(acl.hasRole(role)).to.be.equal(true)
    })
  })

  describe('removeDomainResource(domain, resource)', () =>
  {
    it('should be able to remove a resource from all roles', () =>
    {
      const
      acl       = new Acl,
      role1     = 'foo',
      role2     = 'bar',
      role3     = 'baz',
      resource  = 'qux'
      acl.addRole(role1)
      acl.addRoleDomainResource(role2, 'domain', resource)
      acl.addRoleDomainResource(role3, 'domain', resource)
      expect(acl.hasRoleDomainResource(role1, 'domain', resource)).to.be.equal(false)
      expect(acl.hasRoleDomainResource(role2, 'domain', resource)).to.be.equal(true)
      expect(acl.hasRoleDomainResource(role3, 'domain', resource)).to.be.equal(true)
      acl.removeDomainResource('domain', resource)
      expect(acl.hasRoleDomainResource(role1, 'domain', resource)).to.be.equal(false)
      expect(acl.hasRoleDomainResource(role2, 'domain', resource)).to.be.equal(false)
      expect(acl.hasRoleDomainResource(role3, 'domain', resource)).to.be.equal(false)
    })
  })

  describe('hasRoleDomainResourcePermission(role, domain, resource, permission)', () =>
  {
    it('should return true only if the role has the permission', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      res   = 'bar',
      per   = 'baz'
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(false)
      acl.addRole(role)
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(false)
      acl.addRoleDomainResource(role, 'domain', res)
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(false)
      acl.addRoleDomainResourcePermission(role, 'domain', res, per)
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(true)
    })
  })

  describe('addRoleDomainResourcePermission(role, domain, resource, permission)', () =>
  {
    it('should be able to add a permission to a role', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      res   = 'bar',
      per   = 'baz'
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(false)
      acl.addRoleDomainResourcePermission(role, 'domain', res, per)
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(true)
    })

    it('should add a resource to the role', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      res   = 'bar',
      per   = 'baz'
      expect(acl.hasRoleDomainResource(role, 'domain', res)).to.be.equal(false)
      acl.addRoleDomainResourcePermission(role, 'domain', res, per)
      expect(acl.hasRoleDomainResource(role, 'domain', res)).to.be.equal(true)
    })

    it('should add a role', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      res   = 'bar',
      per   = 'baz'
      expect(acl.hasRole(role)).to.be.equal(false)
      acl.addRoleDomainResourcePermission(role, 'domain', res, per)
      expect(acl.hasRole(role)).to.be.equal(true)
    })
  })

  describe('removeRoleDomainResourcePermission(role, domain, resource, permission)', () =>
  {
    it('should remove a permission from a role resource', () =>
    {
      const
      acl   = new Acl,
      role  = 'foo',
      res   = 'bar',
      per   = 'baz'
      acl.addRoleDomainResourcePermission(role, 'domain', res, per)
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(true)
      acl.removeRoleDomainResourcePermission(role, 'domain', res, per)
      expect(acl.hasRoleDomainResourcePermission(role, 'domain', res, per)).to.be.equal(false)
    })
  })

  describe('removeDomainResourcePermission(domain, resource, permission)', () =>
  {
    it('should remove a permission from a resource on all roles', () =>
    {
      const
      acl   = new Acl,
      role1 = 'foo1',
      role2 = 'foo2',
      role3 = 'foo3',
      res   = 'bar',
      per   = 'baz'
      acl.addRoleDomainResource(role1, 'domain', res)
      acl.addRoleDomainResourcePermission(role2, 'domain', res, per)
      acl.addRoleDomainResourcePermission(role3, 'domain', res, per)
      expect(acl.hasRoleDomainResourcePermission(role1, 'domain', res, per)).to.be.equal(false)
      expect(acl.hasRoleDomainResourcePermission(role2, 'domain', res, per)).to.be.equal(true)
      expect(acl.hasRoleDomainResourcePermission(role3, 'domain', res, per)).to.be.equal(true)
      acl.removeDomainResourcePermission('domain', res, per)
      expect(acl.hasRoleDomainResourcePermission(role1, 'domain', res, per)).to.be.equal(false)
      expect(acl.hasRoleDomainResourcePermission(role2, 'domain', res, per)).to.be.equal(false)
      expect(acl.hasRoleDomainResourcePermission(role3, 'domain', res, per)).to.be.equal(false)
    })

    it('should not remove the role and resouce', () =>
    {
      const
      acl   = new Acl,
      role1 = 'foo1',
      role2 = 'foo2',
      role3 = 'foo3',
      res   = 'bar',
      per   = 'baz'
      acl.addRoleDomainResource(role1, 'domain', res)
      acl.addRoleDomainResourcePermission(role2, 'domain', res, per)
      acl.addRoleDomainResourcePermission(role3, 'domain', res, per)
      acl.removeDomainResourcePermission(res, 'domain', per)
      expect(acl.hasRoleDomainResource(role1, 'domain', res, per)).to.be.equal(true)
      expect(acl.hasRoleDomainResource(role2, 'domain', res, per)).to.be.equal(true)
      expect(acl.hasRoleDomainResource(role3, 'domain', res, per)).to.be.equal(true)
    })
  })

  describe('getUserRoles(user)', () =>
  {
    it('should return a list of all the roles a user have', () =>
    {
      const
      acl   = new Acl,
      user  = 'foobar',
      role1 = 'foo',
      role2 = 'bar',
      role3 = 'baz',
      role4 = 'qux'
      acl.addRoleUser(role1, user)
      acl.addRoleUser(role2, user)
      acl.addRoleChild(role1, role3)
      acl.addRoleChild(role2, role4)
      expect(acl.getUserRoles(user)).to.have.members([role1, role2])
    })
  })

  describe('getUserRolesRecursive(user)', () =>
  {
    it('should return a list of roles and the derieved roles a user have', () =>
    {
      const
      acl       = new Acl,
      user1     = 'foobar1',
      user2     = 'foobar2',
      role1     = 'foo',
      role2     = 'bar',
      role3     = 'baz',
      role4     = 'qux',
      expected  = [role1, role2, role3]
      acl.addRoleUser(role1, user1)
      acl.addRoleUser(role2, user1)
      acl.addRoleChild(role1, role3)
      acl.addRole(role4)
      expect(acl.getUserRolesRecursively(user1)).to.have.members(expected)
      acl.addRoleUser(role4, user2)
      expect(acl.getUserRolesRecursively(user1)).to.have.members(expected)
    })
  })

  describe('getRolesRecursively(role)', () =>
  {
    it('should return a list of roles derieved of the root role', () =>
    {
      const
      acl       = new Acl,
      role1     = 'foo',
      role2     = 'bar',
      role3     = 'baz',
      role4     = 'qux',
      expected  = [role1, role3]
      acl.addRole(role1)
      acl.addRole(role2)
      acl.addRoleChild(role1, role3)
      expect(acl.getRolesRecursively(role1)).to.have.members(expected)
      acl.addRole(role4)
      expect(acl.getRolesRecursively(role1)).to.have.members(expected)
    })
  })

  describe('isUserAuthorized(user, domain, resource, permission)', () =>
  {
    it('should only allow a valid permission', () =>
    {
      const
      acl         = new Acl,
      user        = 'foo',
      role        = 'bar',
      domain      = 'domain',
      resource    = 'baz',
      permission  = 'qux'

      acl.addRoleUser(role, user)
      acl.addRoleDomainResourcePermission(role, domain, resource, permission)
      const result = acl.isUserAuthorized(user, domain, resource, permission)
      expect(result).to.be.equal(true)
    })

    it('should allow a valid permission through a role hierarchy', () =>
    {
      const
      acl         = new Acl,
      user1       = 'foo1',
      user2       = 'foo2',
      role1       = 'bar1',
      role2       = 'bar2',
      domain      = 'domain',
      resource1   = 'baz1',
      resource2   = 'baz2',
      permission  = 'qux'

      acl.addRoleUser(role1, user1)
      acl.addRoleUser(role2, user2)
      acl.addRoleDomainResourcePermission(role1, domain, resource1, permission)
      acl.addRoleDomainResourcePermission(role2, domain, resource2, permission)
      const result1 = acl.isUserAuthorized(user1, domain, resource2, permission)
      expect(result1).to.be.equal(false)
      acl.addRoleChild(role1, role2)
      const result2 = acl.isUserAuthorized(user1, domain, resource2, permission)
      expect(result2).to.be.equal(true)
    })

    it('should not allow an invalid permission', () =>
    {
      const
      acl         = new Acl,
      user1       = 'foo1',
      user2       = 'foo2',
      role1       = 'bar1',
      role2       = 'bar2',
      domain      = 'domain',
      resource1   = 'baz1',
      resource2   = 'baz2',
      permission  = 'qux'

      acl.addRoleUser(role1, user1)
      acl.addRoleUser(role2, user2)
      acl.addRoleDomainResourcePermission(role1, domain, resource1, permission)
      acl.addRoleDomainResourcePermission(role2, domain, resource2, permission)
      const result1 = acl.isUserAuthorized(user1, domain, resource1, permission)
      expect(result1).to.be.equal(true)
      const result2 = acl.isUserAuthorized(user1, domain, resource2, permission)
      expect(result2).to.be.equal(false)
    })
  })

  describe('isRoleAuthorized(role, domain, resource, permission)', () =>
  {
    it('should only allow a valid permission', () =>
    {
      const
      acl         = new Acl,
      role        = 'bar',
      domain      = 'domain',
      resource    = 'baz',
      permission  = 'qux'

      acl.addRole(role)
      acl.addRoleDomainResourcePermission(role, domain, resource, permission)
      const result = acl.isRoleAuthorized(role, domain, resource, permission)
      expect(result).to.be.equal(true)
    })

    it('should allow a valid permission through a role hierarchy', () =>
    {
      const
      acl         = new Acl,
      role1       = 'bar1',
      role2       = 'bar2',
      domain      = 'domain',
      resource1   = 'baz1',
      resource2   = 'baz2',
      permission  = 'qux'

      acl.addRole(role1)
      acl.addRole(role2)
      acl.addRoleDomainResourcePermission(role1, domain, resource1, permission)
      acl.addRoleDomainResourcePermission(role2, domain, resource2, permission)
      const result1 = acl.isRoleAuthorized(role1, domain, resource2, permission)
      expect(result1).to.be.equal(false)
      acl.addRoleChild(role1, role2)
      const result2 = acl.isRoleAuthorized(role1, domain, resource2, permission)
      expect(result2).to.be.equal(true)
    })

    it('should not allow an invalid permission', () =>
    {
      const
      acl         = new Acl,
      role1       = 'bar1',
      role2       = 'bar2',
      domain      = 'domain',
      resource1   = 'baz1',
      resource2   = 'baz2',
      permission  = 'qux'

      acl.addRole(role1)
      acl.addRole(role2)
      acl.addRoleDomainResourcePermission(role1, domain, resource1, permission)
      acl.addRoleDomainResourcePermission(role2, domain, resource2, permission)
      const result1 = acl.isRoleAuthorized(role1, domain, resource1, permission)
      expect(result1).to.be.equal(true)
      const result2 = acl.isRoleAuthorized(role1, domain, resource2, permission)
      expect(result2).to.be.equal(false)
    })

    it('* for resouce should allow access to all resources', () =>
    {
      const
      acl         = new Acl,
      role1       = 'bar1',
      domain      = 'domain',
      resource1   = 'baz1',
      resource2   = 'baz2',
      permission  = 'qux'

      acl.addRole(role1)
      acl.addRoleDomainResourcePermission(role1, domain, '*', permission)
      const result1 = acl.isRoleAuthorized(role1, domain, resource1, permission)
      expect(result1).to.be.equal(true)
      const result2 = acl.isRoleAuthorized(role1, domain, resource2, permission)
      expect(result2).to.be.equal(true)
    })

    it('* for permission should allow access to all permissions', () =>
    {
      const
      acl         = new Acl,
      role1       = 'bar1',
      domain      = 'domain',
      resource1   = 'baz1',
      permission1 = 'qux1',
      permission2 = 'qux2'

      acl.addRole(role1)
      acl.addRoleDomainResourcePermission(role1, domain, resource1, '*')
      const result1 = acl.isRoleAuthorized(role1, domain, resource1, permission1)
      expect(result1).to.be.equal(true)
      const result2 = acl.isRoleAuthorized(role1, domain, resource1, permission2)
      expect(result2).to.be.equal(true)
    })

    it('* for permission and resource should allow access to everything', () =>
    {
      const
      acl         = new Acl,
      role1       = 'bar1',
      domain      = 'domain',
      resource1   = 'baz1',
      resource2   = 'baz2',
      permission1 = 'qux1',
      permission2 = 'qux2'

      acl.addRole(role1)
      acl.addRoleDomainResourcePermission(role1, domain, '*', '*')
      const result1 = acl.isRoleAuthorized(role1, domain, resource1, permission1)
      expect(result1).to.be.equal(true)
      const result2 = acl.isRoleAuthorized(role1, domain, resource2, permission2)
      expect(result2).to.be.equal(true)
    })

    it('undefined permission should allow access on a resource level', () =>
    {
      const
      acl         = new Acl,
      role1       = 'bar1',
      role2       = 'bar2',
      domain      = 'domain',
      resource1   = 'baz1',
      resource2   = 'baz2',
      permission1 = 'qux1',
      permission2 = 'qux2'

      acl.addRole(role1)
      acl.addRole(role2)
      acl.addRoleDomainResourcePermission(role1, domain, resource1, permission1)
      acl.addRoleDomainResourcePermission(role2, domain, resource2, permission2)
      const result1 = acl.isRoleAuthorized(role1, domain, resource1)
      expect(result1).to.be.equal(true)
      const result2 = acl.isRoleAuthorized(role1, domain, resource2)
      expect(result2).to.be.equal(false)
    })
  })
})

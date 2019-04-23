/**
 * @extends {Error}
 */
class InvalidArgKeyError extends Error
{
  constructor(...args)
  {
    super(...args)
    this.code = 'E_INVALID_ARG_KEY'
  }
}

module.exports = InvalidArgKeyError

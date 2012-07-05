var schema = require('../schema')
  , RandExp = require('randexp')
  , _ = require('underscore')

var defaultRandExp = new RandExp(/^[a-zA-Z0-9]{1,10}$/)

var RegexpSchema = module.exports = function(regexp) {
  this.regexp = regexp
  this.randexp = this.regexp ? new RandExp(this.regexp) : defaultRandExp
  
  return this.schema()
}

RegexpSchema.prototype = _.extend(Object.create(schema.prototype), {
  compile : function() {
    return { references : [this.regexp]
           , expression : 'Object(instance) instanceof String'
                        + (this.regexp ? ' && {0}.test(instance)' : '')
           }
  },
  
  generate : function() {
    return this.randexp.gen()
  },
  
  toJSON : function() {
    var json = schema.prototype.toJSON.call(this)
    
    json.type = 'string'
    
    if (this.regexp) {
      json.pattern = this.regexp.toString()s
      json.pattern = json.pattern.substr(1, json.pattern.length - 2)
    }
    
    return json
  }
})

schema.fromJSON.def(function(sch) {
  if (!sch || sch.type !== 'string') return
  
  if ('pattern' in sch) {
    return new RegexpSchema(RegExp('^' + sch.pattern + '$'))
  } else if ('minLength' in sch || 'maxLength' in sch) {
    return new RegexpSchema(RegExp('^.{' + [ sch.minLength || 0, sch.maxLength ].join(',') + '}$'))
  } else {
    return new RegexpSchema()
  }
})

schema.fromJS.def(function(regexp) {
  if (regexp instanceof RegExp) return new RegexpSchema(regexp)
})
var t = require("tcomb-form");

module.exports = t.struct({
  quantity: t.Str,
  item: t.Str
});

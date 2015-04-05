var React = require("react"),
    t = require("tcomb-form");

var Recipe = require("../schemas/recipe.jsx");

var ingredients = function(locals) {
  var inputs = locals.inputs;

  return (
    <fieldset className="form-struct ingredient">
      <div className="form-row quantity">
        {inputs.quantity}
      </div>
      <div className="form-row item">
        {inputs.item}
      </div>
    </fieldset>
  );
};

var struct = function(locals) {
  if (locals.config.type === "ingredients") return ingredients(locals);

  var inputs = locals.inputs;

  return (
    <fieldset className="form-struct recipe">
      <div className="form-row name">
        {inputs.name}
      </div>
      <div className="form-row description">
        {inputs.description}
      </div>
      <div className="form-row ingredients">
        <label>
          <strong>Ingredients</strong>
        </label>
        {inputs.ingredients}
      </div>
      <div className="form-row directions">
        {inputs.directions}
      </div>
    </fieldset>
  );

  return (
    <fieldset className="form-struct">
    {
      locals.order.map(function(field) {
        return (
          <div key={field} className={"form-row " + field}>
            {locals.inputs[field]}
          </div>
        );
      })
    }
    </fieldset>
  );
};

var list = function(locals) {
  return (
    <fieldset className="form-list">
    {
      locals.items.map(function(item) {
        return (
          <div key={item.key}>
            {item.input}
            <div className="form-list-buttons">
            {item.buttons.map(function(btn) {
              return (
                <button key={btn.label} onClick={btn.click}>{btn.label}</button>
              );
            })}
            </div>
          </div>
        );
      })
    }
    <div className="form-list-add-button">
      <button onClick={locals.add.click}>{locals.add.label}</button>
    </div>
    </fieldset>
  );
};

module.exports = {
  auto: 'none',
  templates: {
    struct: struct,
    list: list
  },
  fields: {
    description: {
      type: "textarea"
    },
    directions: {
      type: "textarea"
    },
    ingredients: {
      config: { type: "ingredients" }
    }
  }
};


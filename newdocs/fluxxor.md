Fluxxor
=======

```javascript
var UserStore = Fluxxor.Store.create({
  initialize({...}) {
    this.bindActions(
      "LOGIN_START", this.handleLoginStart,
      "LOGIN_SUCCESS", this.handleLoginSuccess,
      "LOGIN_ERROR", this.handleLoginError
    );
  },

  handleLoginStart(payload, type) {
    this.whatever = things;
    this.emit("change");
  }
});

var stores = {
  user: new UserStore({...}),
  post: new PostStore({...})
};

var actions = {
  user: {
    login(username, password) {
      this.dispatch("LOGIN_START");

      UserAPI.login(username, password).then((user) => {
        this.dispatch("LOGIN_SUCCESS", {user});
      }, (error) => {
        this.dispatch("LOGIN_ERROR", {error});
      });
    }
  }
};

var flux = new Fluxxor.Flux(stores, actions);
```

New API:

```
class UserStore extends Fluxxor.Store {
  constructor(options) {
    super(options);

    this.bindActions(
      "LOGIN_START", this.handleLoginStart,
      "LOGIN_SUCCESS", this.handleLoginSuccess,
      "LOGIN_ERROR", this.handleLoginError
    );
  }

  handleLoginStart(payload, type, dispatch) {
  }
}
```

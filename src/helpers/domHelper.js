window.J$ = (function (wndw, ctx, find) {
  "use strict";
  return function (s) {
    return new find(ctx, s);
  };
})(window, document, function (context, selector) {
  this.parent =
    typeof selector === "object"
      ? selector
      : context.querySelectorAll(selector);
  this.child = [];

  this.append = function () {
    var element = "undefined",
      attribs = {},
      quantity = 1;
    Array.from(arguments).forEach(function (arg) {
      switch (true) {
        case typeof arg === "string":
          element = arg;
          break;
        case typeof arg === "number":
          quantity = arg;
          break;
        case typeof arg === "object":
          attribs = arg;
          break;
      }
    });
    this.parent.forEach(function (e) {
      for (var t = 0; t < quantity; t++) {
        var newBorn = context.createElement(element);
        for (var key in attribs) newBorn.setAttribute(key, attribs[key]);
        e.appendChild(newBorn);
        this.child.push(newBorn);
      }
    }, this);
    return this;
  };
  this.css = (c) => {
    this.child.length === 0
      ? undefined !== c
        ? (undefined !== this.parent[0] ? this.parent : [this.parent]).forEach(
            function (e) {
              for (var key in c) e.style.setProperty(key, c[key]);
            }
          )
        : null
      : this.child.forEach(function (e) {
          for (var key in c) e.style.setProperty(key, c[key]);
        });
    return this;
  };
  this.val = (v) => {
    return this.child.length === 0
      ? undefined !== v
        ? ((undefined !== this.parent[0] ? this.parent : [this.parent]).forEach(
            (x) => (x.value = v)
          ),
          this)
        : this.parent[0].value
      : undefined !== v
      ? (this.child.forEach((x) => (x.value = v)), this)
      : this.child[0].value;
  };
  this.html = (h) => {
    return this.child.length === 0
      ? undefined !== h
        ? ((undefined !== this.parent[0] ? this.parent : [this.parent]).forEach(
            (x) => (x.innerHTML = h)
          ),
          this)
        : this.parent[0].innerHTML
      : undefined !== h
      ? (this.child.forEach((x) => (x.innerHTML = h)), this)
      : this.child[0].innerHTML;
  };
  this.on = (e, f) => {
    this.child.length === 0
      ? (undefined !== this.parent[0] ? this.parent : [this.parent]).forEach(
          (x) => x.addEventListener(e, f)
        )
      : this.child.forEach((x) => x.addEventListener(e, f));
    return this;
  };
});

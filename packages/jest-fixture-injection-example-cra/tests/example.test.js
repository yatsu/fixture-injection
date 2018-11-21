const { sleep } = require("./helper");

describe("Foo", () => {
  fixture("qux", async provide => {
    await provide("QUX1");
  });

  let foo_;

  useFixture(foo => {
    foo_ = foo;
  });

  it("Foo.bar/qux", async (bar, qux) => {
    await sleep(100);
    console.log("Foo.bar", foo_, bar, qux);
    await sleep(100);
  });

  it("Foo.baz", baz => {
    console.log("Foo.baz", foo_, baz);
  });

  describe("Foo.Bar", () => {
    let bar_;

    useFixture(bar => {
      bar_ = bar;
    });

    it("Foo.Bar.baz", baz => {
      console.log("Foo.Bar.baz", foo_, bar_, baz);
    });
  });
});

describe("Bar", () => {
  let bar_;

  useFixture(bar => {
    bar_ = bar;
  });

  describe("Bar.Foo", () => {
    let foo_;

    useFixture(foo => {
      foo_ = foo;
    });

    it("Bar.Foo.baz", baz => {
      console.log("Bar.Foo.baz", bar_, foo_, baz);
    });
  });
});

describe("Baz", () => {
  let baz_;

  useFixture(baz => {
    baz_ = baz;
  });

  it("Baz.bar", bar => {
    console.log("Baz.bar", baz_, bar);
  });

  // eslint-disable-next-line
  xit("Baz.skip", foo => {
    console.log("Baz.skip", baz_, foo);
  });
});

const MDParser = require("./MDParser");
const path = require("path");

const parser = new MDParser({
  path: path.resolve(__dirname, "src", "pages", "test.md"),
});
parser.run().then((r) => {
  console.log(r);
});

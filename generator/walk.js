const fs = require('fs')
const path = require('path')
async function walk(dir) {
  let results = [];
  const list = await fs.promises.readdir(dir)
  var pending = list.length;
  if (!pending) {
    return results
  }
  for await (let file of list) {
    try {
      file = path.resolve(dir, file)
      const stat = await fs.promises.stat(file)
      if (stat && stat.isDirectory()) {
        const res = await walk(file)
        results = [...results, res]
        if (!--pending) {
          return results
        }
      } else {
        results.push(file)
        if (!--pending) {
          return results
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
};
module.exports = walk;
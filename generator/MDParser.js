const frontmatter = require("@github-docs/frontmatter");
const fs = require("fs");
const marked = require("marked");

class MDParser {
  constructor({ path: pathName }) {
    this.pathName = pathName;
  }
  async getMarkdown(pathName) {
    try {
      const file = await fs.promises.readFile(pathName);
      return file.toString();
    } catch (err) {
      console.error("Can't read markdown file", err);
    }
  }
  async run() {
    try {
      const md = await this.getMarkdown(this.pathName);
      const { data, content, errors } = frontmatter(md);
      if (errors.length > 0) {
        throw errors;
      }
      const html = marked(content);
      return {
        html,
        data,
      };
    } catch (err) {
      console.error("Problems reading frontmatter data", err);
    }
  }
}

module.exports = MDParser;

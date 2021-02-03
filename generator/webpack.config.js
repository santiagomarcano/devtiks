const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MDParser = require("./MDParser")
const walk = require('./walk')

const tree = {}

function flat(arr) {
  return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flat(val)) : acc.concat(val), []);
}

async function getHTMLPluginInstance(pageName) {
  if (typeof pageName !== 'string') {
    return Promise.all(pageName.map(getHTMLPluginInstance))
  }
  const [name] = pageName.split(".");
  try {
    const mdParser = new MDParser({
      path: path.resolve(process.cwd(), "src", "pages", pageName)
    })
    const { data, html } = await mdParser.run();
    tree[pageName.replace(/^.*[\\\/]/, '').split('.')[0]] = data
    if (!data.template) {
      throw 'template is estrictly needed'
    }
    let filename = pageName.split('pages')[1].split(path.sep)
    filename[filename.length - 1] = filename[filename.length - 1].split('.')[0]
    filename = `${filename.join('/')}/index.html`
    if (data.path) {
      filename = `./${data.path}/index.html`
    }
    return new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), "src", "templates", `${data.template}.ejs`),
      filename: name.includes('index') ? 'index.html' : filename,
      body: html,
      templateParameters: data,
      chunks: data.scripts || ['index'],
    });
  } catch (err) {
    console.log(err)
    return err
  }
}

async function getEntries() {
  const entries = {}
  let scripts = flat(await walk(path.join("src", "scripts")))
  for (const script of scripts) {
    const name = script.replace(/^.*[\\\/]/, '').split('.')[0]
    entries[name] = script 
  }
  return entries
}

async function getPages() {
  try {
    const pages = await walk(path.join(process.cwd(), "src", "pages"));
    const htmlPlugins = flat(await Promise.all(pages.map(getHTMLPluginInstance)))
    const entries = await getEntries()
    return {
      pages: htmlPlugins,
      entries,
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = async () => {
  let { entries, pages } = await getPages()
  for (let page of pages) {
    page.userOptions.templateParameters.tree = tree
  }
  return {
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          {
            to: path.resolve(process.cwd(), "dist", "assets"),

            from: path.resolve(process.cwd(), "src", "assets"),
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
      ...pages,
    ],
    output: {
      path: path.join(process.cwd(), "dist"),
      publicPath: '/',
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.js$/u,
          loader: "babel-loader",
          exclude: /node_modules/u,
        },
        {
          use: [
            { loader: "style-loader" },
            {
              options: {
                esModule: false,
              },
              loader: MiniCssExtractPlugin.loader,
            },
            {
              options: { url: false },
              loader: "css-loader",
            },
            // { loader: "postcss-loader" },
            {
              options: { sourceMap: true },
              loader: "sass-loader",
            },
          ],
          test: /\.scss$/u,
        },
      ],
    },
    entry: entries,
    devServer: {
      port: 3000,
      contentBase: path.join(__dirname, "./dist"),
    },
  };
};

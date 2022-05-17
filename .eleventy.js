const { DateTime } = require('luxon');
const readingTime = require('eleventy-plugin-reading-time');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const htmlmin = require('html-minifier')
const fs = require('fs');
const path = require('path');

const isDev = process.env.ELEVENTY_ENV === 'development';
const isProd = process.env.ELEVENTY_ENV === 'production'

const manifestPath = path.resolve(
  __dirname,
  'public',
  'assets',
  'manifest.json'
);

const manifest = isDev
  ? {
      'main.js': '/assets/main.js',
      'main.css': '/assets/main.css',
    }
  : JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }));

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(readingTime);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);

  // Add KaTeX
  let markdownIt = require("markdown-it");
  let markdownItKaTeX = require('@iktakahiro/markdown-it-katex');
  let options = {
    html: true
  };
  let markdownLib = markdownIt(options).use(markdownItKaTeX);
  
  eleventyConfig.setLibrary("md", markdownLib);

  // setup mermaid markdown highlighter
  const highlighter = eleventyConfig.markdownHighlighter;
  eleventyConfig.addMarkdownHighlighter((str, language) => {
    if (language === 'mermaid') {
      return `<pre class="mermaid">${str}</pre>`;
    }
    return highlighter(str, language);
  });

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addPassthroughCopy({ 'src/images': 'images' });
  eleventyConfig.setBrowserSyncConfig({ files: [manifestPath] });

  eleventyConfig.addShortcode('bundledcss', function () {
    return manifest['main.css']
      ? `<link href="${eleventyConfig.getFilter('url')(manifest['main.css'])}" rel="stylesheet" />`
      : '';
  });

  eleventyConfig.addShortcode('bundledjs', function () {
    return manifest['main.js']
      ? `<script src="${eleventyConfig.getFilter('url')(manifest['main.js'])}"></script>`
      : '';
  });

  eleventyConfig.addFilter('excerpt', (post) => {
    content = post
    // const content = post.replace(/(<([^>]+)>)/gi, '');
    return content.substr(0, content.lastIndexOf(' ', 200)) + '...';
  });

  eleventyConfig.addFilter("md", function (content = "") {
    return markdownIt({ html: true }).use(markdownItKaTeX).render(content);
  });

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'dd LLL yyyy'
    );
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  eleventyConfig.addFilter('dateToIso', (dateString) => {
    return new Date(dateString).toISOString()
  });

  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  const yearList = Array.from(new Array(21), (x, i) => String(i + 2001));

  eleventyConfig.addCollection('yearList', function (collection) {
    // return [...new Set(collection.getFilteredByTag("part-ia").map(post => String(post.data.year)))]
    return yearList
  });

  for (const year of yearList) {
    eleventyConfig.addCollection("ia-" + year, collection => {
      return collection.getFilteredByTags("part-ia", year)
    })
    eleventyConfig.addCollection("ib-" + year, collection => {
      return collection.getFilteredByTags("part-ib", year)
    })
    eleventyConfig.addCollection("ii-" + year, collection => {
      return collection.getFilteredByTags("part-ii", year)
    })
  }

  eleventyConfig.addCollection('iaCourseList', function (collection) {
    let courseSet = new Set();
    collection.getFilteredByTag("part-ia").forEach(function (item) {
      if ('course' in item.data) {
        courseSet.add(item.data.course)
      }
    });

    return [...courseSet].sort();
  });

  eleventyConfig.addCollection('ibCourseList', function (collection) {
    let courseSet = new Set();
    collection.getFilteredByTag("part-ib").forEach(function (item) {
      if ('course' in item.data) {
        courseSet.add(item.data.course)
      }
    });

    return [...courseSet].sort();
  });

  eleventyConfig.addCollection('iiCourseList', function (collection) {
    let courseSet = new Set();
    collection.getFilteredByTag("part-ii").forEach(function (item) {
      if ('course' in item.data) {
        courseSet.add(item.data.course)
      }
    });

    return [...courseSet].sort();
  });

  eleventyConfig.addCollection('tagList', function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach(function (item) {
      if ('tags' in item.data) {
        let tags = item.data.tags;

        tags = tags.filter(function (item) {
          switch (item) {
            case 'all':
            case 'nav':
            case 'post':
            case 'papers':
            case 'posts':
              return false;
          }

          return true;
        });

        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    });

    return [...tagSet];
  });

  eleventyConfig.addFilter('pageTags', (tags) => {
    const generalTags = ['all', 'nav', 'post', 'posts', 'questions'];

    return tags
      .toString()
      .split(',')
      .filter((tag) => {
        return !generalTags.includes(tag);
      });
  });

  eleventyConfig.addFilter("inspect", require("util").inspect);


  eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
    if ( outputPath && outputPath.endsWith(".html") && isProd) {
      return htmlmin.minify(content, {
        removeComments: true,
        collapseWhitespace: true,
        useShortDoctype: true,
      });
    }

    return content;
  });

  return {
    dir: {
      input: 'src',
      output: 'public',
      includes: 'includes',
      data: 'data',
      layouts: 'layouts'
    },
    passthroughFileCopy: true,
    templateFormats: ['html', 'njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    // pathPrefix: "/cambridge-maths-tripos-questions/"
  };
};

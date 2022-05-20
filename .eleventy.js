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

  const earliestYear = 2001;
  const currentYear = 2021; // easily visible to update each year; could obtain by searching posts instead?
  const yearList = Array.from(new Array(1+currentYear-earliestYear), (x, i) => String(i + earliestYear));
  const triposPartList = ["ia","ib","ii"];

  eleventyConfig.addCollection('yearList', function (collection) {
    // return [...new Set(collection.getFilteredByTag("part-ia").map(post => String(post.data.year)))]
    return yearList
  });
  
  for (const triposPart of triposPartList) {
    // questions by year + part
    for (const year of yearList) {
      eleventyConfig.addCollection(triposPart + "-" + year, collection => {
        return collection.getFilteredByTags("part-"+triposPart, year)
      }     
    }
    
    // collection of all courses for this part
    let courseSet = new Set();
    eleventyConfig.addCollection(triposPart+'CourseList', function (collection) {
      collection.getFilteredByTag("part-"+triposPart).forEach(function (item) {
        if ('course' in item.data) {
          courseSet.add(item.data.course)
        }
      });
      return [...courseSet].sort();
    });
    
    // collection of current courses for this part
    let currentSet = new Set();
    eleventyConfig.addCollection(triposPart+'Current', function (collection) {
      collection.getFilteredByTag("part-"+triposPart, currentYear).forEach(function (item) {
        if ('course' in item.data) {
          currentSet.add(item.data.course)
        }
      });
      return [...currentSet].sort();
    });
    
    // collection of discontinued courses for this part
    let discontinuedSet = new Set();
    for (const course of courseSet) {
      if (!currentSet.has(course)) {
        discontinuedSet.add(course);
      }
    }
    eleventyConfig.addCollection(triposPart+'Old', function (collection) {
      return [...discontinuedSet].sort();
    });    
  }
  
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

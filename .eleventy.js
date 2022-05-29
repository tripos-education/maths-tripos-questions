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
  
  
  
  const triposPartList = ["ia","ib","ii"];
  eleventyConfig.addCollection('triposPartList', function (collection) {
    return triposPartList;
  });

  // save all the data we need to sort courses as an  object in a collection
  // need to do this because there isn't any way to reliably cross-communicate between the
  // addCollection callback functions.
  
  eleventyConfig.addCollection('sortingData', function (collection) {
  	// do this stuff in an addCollection callback so that everything we need can be computed
  	let sortingData = {"triposPartList" : triposPartList};
  	let years = new Set();
  	
  	// initial run through to find years and courses
  	for (const triposPart of triposPartList) {
  		let allCourses = new Set();
  		for (const item of collection.getFilteredByTag(triposPart.toUpperCase())) {
  			if ('course' in item.data) {
  				allCourses.add(item.data.course);
  			}
  			if ('year' in item.data) {
  				years.add(item.data.year);
  			}
  		}
  		sortingData[triposPart]= {"allCourses": [...allCourses].sort()};
  	}
  	
  	const currentYear = String(Math.max(...years));
  	sortingData.years = [...years].sort().map(year => String(year));
  	
  	// separate current and old courses
  	let courses = new Set();
  	for (const triposPart of triposPartList) {
  		let currentCourses = new Set();
  		let oldCourses = new Set();
  		for (const course of sortingData[triposPart].allCourses) {
  			courses.add(course);
  			if (collection.getFilteredByTags(course, currentYear).length > 0) {
  				currentCourses.add(course);
  			} else {
  				oldCourses.add(course);
  			}
  			
  		}
  		sortingData[triposPart].currentCourses = [...currentCourses].sort();
  		sortingData[triposPart].oldCourses = [...oldCourses].sort();
  	}
  	
  	
  	// create 'sorted collections' – i.e. for each course, years are grouped together
  	// note that due to Markov Chains and Electromagnetism switching tripos part in 2004,
  	// we need the `courses` set rather than iterating over each tripos part.
  	for (const course of courses) {
  			let questionList = {};
  			for (const year of sortingData.years) {
  				let qns = new Set();
  				collection.getFilteredByTags(course, year).forEach( (item) => {
  					qns.add(item);
  				});
  				questionList[year] = [...qns].sort(function(a,b) {
  					// sort by builtin string ordering function:
  					// puts paper 1 first, *then* section I before section II !
  					if (a.data.title.toLowerCase() > b.data.title.toLowerCase()) {
  						return 1;
  					} else {
  						return -1;
  					}
  				});
  			}
  			sortingData[course] = questionList;
  	}
  	
  	// sort into tripos part + year pages
  	for (const triposPart of triposPartList) {
  	for (const year of sortingData.years) {
  			let questionList = {};
  			for (const course of sortingData[triposPart].allCourses) {
  				let qns = new Set();
  				collection.getFilteredByTags(course, year, triposPart.toUpperCase()).forEach( (item) => {
  					qns.add(item);
  				});
  				questionList[course] = [...qns].sort(function(a,b) {
  					if (a.data.title.toLowerCase() > b.data.title.toLowerCase()) {
  						return 1;
  					} else {
  						return -1;
  					}
  				});
  			}
  			sortingData[triposPart][year] = questionList;
  	}
  	}
  	return sortingData;
  });
  
  
  // create course collection for purposes of pagination
  // annoyingly this has to be done separately because eleventy seemingly won't let me
  // paginate over anything other than a collection,
  // and you can't cross-communicate between `addCollection` callbacks.
  eleventyConfig.addCollection ('courses', function (collection) {
  	let courses = new Set();
  	// only search through questions...
  	collection.getFilteredByGlob("**/*.md").forEach( (item) => {
  		if ("course" in item.data) {
  			courses.add(item.data.course);
  		}
  	});
  	return [...courses];
  });
  
  // create part+year collection for purposes of pagination
  // again this is inefficient but required for the above-mentioned reasons
  eleventyConfig.addCollection ('partsAndYears', function (collection)  {
  	let partsAndYears = [];
  	for (const triposPart of triposPartList) {
  		let partYears = new Set();
  		for (const item of collection.getFilteredByTag(triposPart.toUpperCase())) {
  			if ("year" in item.data) {
  				partYears.add(item.data.year);
  			}
  		}
  		
  		for (const y of partYears) {
  			partsAndYears.push({"part": triposPart, "year": String(y)});
  		}
  	}
  	
  	return partsAndYears;	
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

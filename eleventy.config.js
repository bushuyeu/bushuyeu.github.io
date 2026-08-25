import yaml from "js-yaml";

export default function (eleventyConfig) {
  // Let data files be written as YAML as well as JSON.
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // Copy static assets through untouched.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Dates: news entries and post front matter use plain YYYY-MM-DD strings,
  // which Eleventy parses as UTC. Format in UTC too, or dates shift a day.
  eleventyConfig.addFilter("monthYear", (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
  );
  eleventyConfig.addFilter("fullDate", (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  // Longer pieces: any .md dropped into src/writing/ becomes a post.
  eleventyConfig.addCollection("writing", (api) =>
    api.getFilteredByGlob("src/writing/*.md").reverse()
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}

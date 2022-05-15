--- 
layout: base.njk 
title: 'FAQ'
permalink: "faq/"
description: All about the site
---

## FAQ

---

### General

#### *What is this?*

An archive of questions from the [Cambridge Mathematics Tripos](https://www.maths.cam.ac.uk/undergrad/pastpapers/past-ia-ib-and-ii-examination-papers) in handy blog format.

#### *Is this an official University site?*

No.

#### *Can you add...?*

Maybe! Let us know by commenting below.

---

### Comments

#### *Can I use $\LaTeX$?*

Yes! Use `$...$` for inline, and `$$...$$` for math blocks. You can even copy and paste $\LaTeX$ from the questions and other comments.

#### *Is there a quicker way?*

Try [Mathpix Snip](https://mathpix.com/) to convert your handwritten equations into $\LaTeX$.

#### *Can I hide spoilers?*


<details>
<summary>Yes, you do it like this:</summary>
  
  ```markdown
  <details>
  <summary>Spoiler warning</summary>
  
  Hidden text goes here.
  
</details>
```

Note that you have to leave a blank line after `</summary>`. 
  
</details>


#### *Why do I need a GitHub account?*

The comments live on [GitHub discussions](https://github.com/tripos-education/maths-tripos-questions/discussions) and are created by a fork of the wonderful [Giscus app](https://giscus.app/).

#### *Why can't I edit / delete a comment?*

This is not implemented yet in Giscus, but clicking the comment's timestamp (e.g. "2 hours ago") will take you to the comment's page on GitHub discussions, where you can edit / delete comments. (On GitHub, click the <kbd>...</kbd> in the top right-hand corner of the comment to see these options).

#### *Can I attach an image?*

This isn't yet supported by the GitHub discussions API. If you add an image on GitHub, however, it will show up here.

---

### Technical

#### *How was it made?*

The original PDFs were converted to markdown / $\LaTeX$ using the [Mathpix](https://mathpix.com/) API. The blog itself is built using [Eleventy](https://www.11ty.dev/) and is based on the [Eleventy Duo](https://eleventyduo.netlify.app/) template. It's hosted on Netlify.

#### *Can I contribute?*

Yes! The code is [on GitHub](https://github.com/tripos-education/maths-tripos-questions). You can [join the discussion](https://github.com/tripos-education/maths-tripos-questions/discussions) on new ideas, [open an issue](https://github.com/tripos-education/maths-tripos-questions/issues), or submit a pull request.


{% set latestComments = '0' %}
{% include "tripos-comments.njk" %}

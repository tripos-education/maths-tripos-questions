# Cambridge Maths Tripos Questions

## Errata

### Altered course names

For self-consistency, the course names of the following questions have been altered from how they appear in their original exam papers:

- 2009 Part IB 'Mathematical Methods' questions -> IB 'Methods'
- 2019, 2021 Part II 'Fluids' -> 'Fluids II'
- 2017 Part II 'Topics In Analysis' -> 'Topics in Analysis'
- 2017, 2018 Part II 'Coding & Cryptography' -> 'Coding and Cryptography'

When new questions are added to this site, be wary of the possibility of such variations in course names. (Especially for Part II Fluids).

### Anomalies regarding the 2004 Tripos reform

The current Part IB courses 'Markov Chains' and 'Electromagnetism' were Part II courses prior to 2005.

---

## FAQ

---

### General

#### *What is this?*

An archive of questions from the [Cambridge Mathematics Tripos](https://www.maths.cam.ac.uk/undergrad/pastpapers/past-ia-ib-and-ii-examination-papers) in handy blog format.

#### *Is this an official University project?*

No.

#### *Can you add...?*

Maybe! Get in touch using one of the methods below.

---

### Comments

#### *Can I use LaTeX?*

Yes! Use `$...$` for inline, and `$$...$$` for math blocks. You can even copy and paste LaTeX from the questions and other comments.

#### *Is there a quicker way?*

Try [Mathpix Snip](https://mathpix.com/) to convert your handwritten equations into LaTeX.

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

This is not implemented yet in Giscus, but you can click through to the comment on GitHub and edit / delete there.

#### *Can I attach an image?*

This isn't yet supported by the GitHub discussions API. If you add an image on GitHub, however, it will show up here.

---

### Technical

#### *How was it made?*

The original PDFs were converted to markdown / LaTeX using the [Mathpix](https://mathpix.com/) API. The blog itself is built using [Eleventy](https://www.11ty.dev/) and is based on the [Eleventy Duo](https://eleventyduo.netlify.app/) template. It's hosted on Netlify.

#### *Can I contribute?*

Yes! The code is [on GitHub](https://github.com/tripos-education/maths-tripos-questions). You can [join the discussion](https://github.com/tripos-education/maths-tripos-questions/discussions) on new ideas, [open an issue](https://github.com/tripos-education/maths-tripos-questions/issues), or submit a pull request.

---

## Getting Started


- Install dependencies with `yarn install`

- Serve the site locally with `yarn dev`

- Use `yarn build` to build a production version of the site.

- You may need to use `node --max-old-space-size=6000 ./node_modules/@11ty/eleventy/cmd.js` to stop Node running out of memory due to the large amount of content.

- If you only wish to test a part of the site, it is advisable to remove unneeded question files from your local clone of this repository.

## TODOs

- [x] Deployment 

- [x] Add KaTeX [copy-tex](https://github.com/KaTeX/KaTeX/tree/main/contrib/copy-tex) extension.

- [x] Fix missing subjects

- [x] First 2011 IB question is messed up (course list wasn't removed)

- [x] Add descriptive `<title>` and `og:title` that can be used by Giscus

- [ ] Social media card for each question for posting on Twitter, Discord, etc.

- [ ] Update "powered by giscus" and add KaTeX message

- [ ] Add comment counts for giscus. This seems a bit harder see [this PR](https://github.com/giscus/giscus/pull/198)

- [ ] Fixing images that don't need to be images because they are imperfectly converted text

- [ ] Downloading images from Mathpix CDN. 

- [X] Missing dagger in 1.II.6B (2005)

- [x] Add "comment on" to each question in post list

- [x] Add Google analytics

- [x] Add tripos domain

- [ ] SEO and keywords

- [ ] Titles and descriptions meta tags still not working for question lists

- [X] Spoiler rendering in comments


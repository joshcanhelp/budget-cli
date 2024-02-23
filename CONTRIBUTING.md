# Contributing

Thank you in advance! I'm happy to accept issues reporting problems or desired functionality so contributionsof all types are welcome! I recognize that not everyone using this tool will not be able to contribute code so read through the following list for how I can help. 

### I want to add a translator!

That's great, I appreciate it! There are one of two ways to do this:

- If you can write TypeScript, use the [example translator](src/translators/example.ts) to add a new one and follow the [code changes](#i-want-to-make-code-changes) instructions below.
- If you can't (or don't want to) submit code, please [open a new Issue](https://github.com/joshcanhelp/budget-cli/issues) with the following:
    1. The name of the financial institution
    1. An example CSV with at least 5 rows in a `code` block (remove anything sensitive)
    1. Anything else I might need to know about the data and how it's structured

### I found a bug or want a new feature!

Happy to help! Feel free to [open a new Issue](https://github.com/joshcanhelp/budget-cli/issues) with a complete description of what you want to do.

### I want to make code changes!

That's also great, thank you so much! This project is written in TypeScript, checked with ESLint, and formatted with prettier. Bug fixes and small features are fine as a PR with a good description. If you want to do something crazy or foundational, I'd recommend starting with a feature request issue first.

Development workflow is to checkout a new branch and start TypeScript in a CLI tab:

```bash
$ git checkout -b feat/new-feature
$ npm run dev
```

Please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)!

Open up a new tab and do your work there. As you develop, TypeScript will tell you what you're doing wrong (that's what it's for). Once things are compiling and you're ready to submit the PR, run formatting:

```bash
$ npm run format
```

You can save some cycles and headache by using the pre-commit script in this repo:

```bash
$ cp pre-commit.sh .git/hooks/pre-commit
```

Once you're happy with it, push the branch here and open a PR. A GitHub Actions will check the TypeScript builds and that the formatting has been done. Give the PR a nice description and I'll get to it as soon as I can!
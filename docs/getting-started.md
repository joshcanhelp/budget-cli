# Getting Started

This tool is written in TypeScript and targets Node 16 and above but it may work in earlier versions. You will need to have Node and `npm` installed (I recommend [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for this) before following the steps below.

Clone this repo and install dependencies:

```bash
$ git clone git@github.com:joshcanhelp/budget-cli.git
$ npm ci
```

Build the TS files:

```bash
$ npm run build
```

The script defaults to `./output/data.csv` for it's database so, to test it out, create that file and try to run a report:

```bash
$ mkdir output
$ touch output/data.csv
```

You should see the following output:

```
$ ./bin/run.js report
🤖 Reading from ./output/data.csv
❌ No transactions found for 2023.
```

You are now (probably) ready to go!
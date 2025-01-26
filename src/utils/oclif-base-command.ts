import { Args, Command, Flags, Interfaces } from "@oclif/core";
import { Configuration, getConfiguration } from "./config.js";
import { isObjectWithKeys } from "./index.js";

////
/// Types
//

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof ImportBaseCommand)["baseFlags"] & T["flags"]
>;

export type Args<T extends typeof Command> = Interfaces.InferredArgs<T["args"]>;

////
/// Exports
//

export const importNameArg = {
  importName: Args.string({
    required: true,
    name: "APINAME",
  }),
};

export abstract class ImportBaseCommand<T extends typeof Command> extends Command {
  static override baseFlags = {};

  static override flags = {
    year: Flags.string({
      char: "y",
      summary: "Year to import",
      default: `${new Date().getFullYear()}`,
    }),
    output: Flags.string({
      char: "o",
      summary: "Path to output CSV",
      default: "",
    }),
    date: Flags.string({
      summary: "Date used for filtering",
      default: "",
    }),
  };

  protected flags!: Flags<T>;
  protected args!: Args<T>;
  protected conf!: Configuration;

  public override async init(): Promise<void> {
    await super.init();
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof ImportBaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: true,
    });

    this.flags = flags as Flags<T>;
    this.args = args as Args<T>;
    this.conf = getConfiguration();

    // TODO: This should be in ../utils/config.js but errors aren't thrown properly
    if (!this.conf.wantNeedTracking) {
      if (isObjectWithKeys(this.conf.expenseTypeMapping)) {
        throw new Error("Found expenseTypeMapping when wantNeedTracking is off.");
      }

      const hasExpenseType = (this.conf.autoCategorization || [])
        .map((el, index) => {
          return el.categorization.expenseType ? index : null;
        })
        .filter((el) => typeof el === "number");

      if (hasExpenseType.length) {
        throw new Error(
          "Found expenseTypein autoCategorization when wantNeedTracking is off."
        );
      }
    }
  }

  protected override async catch(err: Error & { exitCode?: number }) {
    await super.catch(err);
  }

  protected override async finally(_: Error | undefined) {
    await super.finally(_);
  }
}

import ts from "typescript";


export function compileTypeScript(
    source: string,
): string {

    const result =
        ts.transpileModule(
            source,
            {
                compilerOptions: {
                    target:
                        ts.ScriptTarget.ES2022,

                    module:
                        ts.ModuleKind.ESNext,

                    strict: false,
                },
            },
        );

    return result.outputText;
}
// deno-lint-ignore no-explicit-any
async function getRoutes(routes: any, dirPath: string, routePath: string) {
    for await (const dirEntry of Deno.readDir(dirPath)) {
        const { name: fullName, isFile, isDirectory } = dirEntry;

        if (fullName.startsWith("_")) {
            continue;
        }

        const ext = fullName.match(/\..*$/);

        if (ext && !/.js|.jsx|.ts|.tsx/.test(ext[0])) {
            continue;
        }

        const name = ext && ext[0] ? fullName.replace(ext[0], "") : fullName;

        if (isFile) {
            routes[name] = name === "index"
                ? routePath || "/"
                : `${routePath}/${name}`;
        }
        if (isDirectory) {
            // deno-lint-ignore no-explicit-any
            const dirRoutes = {} as any;
            await getRoutes(
                dirRoutes,
                `${dirPath}/${name}`,
                `${routePath}/${name}`,
            );
            if (name.startsWith("[") && name.endsWith("]")) {
                dirRoutes.__place_holder = ")";
            }
            routes[name] = dirRoutes;
        }
    }

    return routes;
}

function customReplacer(_key: string, value: string) {
    if (
        typeof value === "string" && value.includes("[") && value.includes("]")
    ) {
        const funcBody = value.replace(/\[([^\]]+)\]/g, "${$1}");

        // these brackets help identify replacing later
        return `\`${funcBody}\``;
    }
    return value;
}

// deno-lint-ignore no-explicit-any
const routes: any = {};

const routeObj = await getRoutes(routes, "./routes", "");

const routeJSON = JSON.stringify(routeObj, customReplacer, 4);

const withFunctions = routeJSON
    .replace(/"\[(.*)\]":/g, "$1: ($1: string) => (")
    .replace(/"__place_holder": "\)"[\s\S]*?}/gm, "})")
    .replace(/\(\s*"\`/g, "`")
    .replace(/"`/g, "`")
    .replace(/`\"/g, "`");

const tsData = `export default ${withFunctions}`;

Deno.writeTextFileSync("./routes.ts", tsData);

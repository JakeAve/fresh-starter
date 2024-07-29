// deno-lint-ignore no-explicit-any
const routes: any = {};

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
            // if (name.startsWith("[") && name.endsWith("]")) {
            //     const paramName = name.slice(1, -1);
            //     routes[name] = `${routePath}/:${paramName}`;
            // } else {
            routes[name] = name === "index"
                ? routePath || "/"
                : `${routePath}/${name}`;
            // }
        }
        if (isDirectory) {
            // deno-lint-ignore no-explicit-any
            routes[name] = {} as any;
            await getRoutes(
                routes[name],
                `${dirPath}/${name}`,
                `${routePath}/${name}`,
            );
        }
    }

    return routes;
}

const foo = await getRoutes(routes, "./routes", "");

console.log(foo);

// deno-lint-ignore no-explicit-any
function customReplacer(_key: string, value: any) {
    if (typeof value === 'string' && value.includes('[') && value.includes(']')) {
        const args = (value.match(/\[([^\]]+)\]/g) as RegExpMatchArray).map(arg => arg.replace(/\[([^\]]+)\]/g, '$1: string'));
        const funcArgs = args.join(', ');
        const funcBody = value.replace(/\[([^\]]+)\]/g, '${$1}');
        return `(${funcArgs}) => \`${funcBody}\``;
      }
      return value;
  }

const bar = JSON.stringify(foo, customReplacer, 4);

console.log(bar);

const data = `export default ${bar.replace(/"\(/g, '(').replace(/\`"/g, '`')}`


Deno.writeTextFileSync('./routes2.ts', data);
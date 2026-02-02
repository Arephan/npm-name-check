#!/usr/bin/env node
import https from "https";
const COLORS = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
};
function parseArgs() {
    const args = process.argv.slice(2);
    const options = { names: [], similar: false, help: false };
    for (const arg of args) {
        if (arg === "-h" || arg === "--help")
            options.help = true;
        else if (arg === "-s" || arg === "--similar")
            options.similar = true;
        else if (!arg.startsWith("-"))
            options.names.push(arg.toLowerCase());
    }
    return options;
}
function showHelp() {
    console.log(`
${COLORS.bold}npm-check${COLORS.reset} - Check if npm package names are available

${COLORS.bold}USAGE${COLORS.reset}
  npm-check <name> [name2] [name3] ...

${COLORS.bold}OPTIONS${COLORS.reset}
  -s, --similar    Suggest similar available names
  -h, --help       Show this help

${COLORS.bold}EXAMPLES${COLORS.reset}
  npm-check my-cool-package
  npm-check react vue angular
  npm-check my-app -s
`);
}
function checkName(name) {
    return new Promise((resolve) => {
        const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
        https.get(url, (res) => {
            if (res.statusCode === 404) {
                resolve({ name, available: true });
            }
            else if (res.statusCode === 200) {
                resolve({ name, available: false });
            }
            else {
                resolve({ name, available: false, error: `HTTP ${res.statusCode}` });
            }
        }).on("error", (err) => {
            resolve({ name, available: false, error: err.message });
        });
    });
}
function generateSimilar(name) {
    const suggestions = [];
    const prefixes = ["my-", "the-", "use-", "node-", "js-", "ts-"];
    const suffixes = ["-js", "-ts", "-cli", "-lib", "-app", "-io", "-dev"];
    for (const prefix of prefixes) {
        if (!name.startsWith(prefix)) {
            suggestions.push(prefix + name);
        }
    }
    for (const suffix of suffixes) {
        if (!name.endsWith(suffix)) {
            suggestions.push(name + suffix);
        }
    }
    // Add number suffixes
    suggestions.push(name + "2", name + "-v2", name + "-next");
    return suggestions.slice(0, 10);
}
function isValidNpmName(name) {
    if (name.length === 0)
        return { valid: false, reason: "Name cannot be empty" };
    if (name.length > 214)
        return { valid: false, reason: "Name too long (max 214)" };
    if (name.startsWith(".") || name.startsWith("_"))
        return { valid: false, reason: "Cannot start with . or _" };
    if (name !== name.toLowerCase())
        return { valid: false, reason: "Must be lowercase" };
    if (/[~'!()*]/.test(name))
        return { valid: false, reason: "Contains invalid characters" };
    if (encodeURIComponent(name) !== name)
        return { valid: false, reason: "Contains invalid characters" };
    return { valid: true };
}
async function main() {
    const options = parseArgs();
    if (options.help) {
        showHelp();
        process.exit(0);
    }
    if (options.names.length === 0) {
        console.error("Error: No package name provided");
        console.error("Usage: npm-check <name>");
        process.exit(1);
    }
    console.log();
    for (const name of options.names) {
        const validation = isValidNpmName(name);
        if (!validation.valid) {
            console.log(`${COLORS.yellow}⚠${COLORS.reset}  ${COLORS.bold}${name}${COLORS.reset} - Invalid: ${validation.reason}`);
            continue;
        }
        const result = await checkName(name);
        if (result.error) {
            console.log(`${COLORS.yellow}?${COLORS.reset}  ${COLORS.bold}${name}${COLORS.reset} - Error: ${result.error}`);
        }
        else if (result.available) {
            console.log(`${COLORS.green}✓${COLORS.reset}  ${COLORS.bold}${name}${COLORS.reset} - ${COLORS.green}Available!${COLORS.reset}`);
        }
        else {
            console.log(`${COLORS.red}✗${COLORS.reset}  ${COLORS.bold}${name}${COLORS.reset} - ${COLORS.red}Taken${COLORS.reset}`);
            if (options.similar) {
                const suggestions = generateSimilar(name);
                console.log(`${COLORS.dim}   Checking alternatives...${COLORS.reset}`);
                for (const suggestion of suggestions) {
                    const sugResult = await checkName(suggestion);
                    if (sugResult.available) {
                        console.log(`   ${COLORS.green}✓${COLORS.reset} ${suggestion}`);
                    }
                }
            }
        }
    }
    console.log();
}
main();

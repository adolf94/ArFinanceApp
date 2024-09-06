const { spawn } = require("node:child_process");
require("dotenv").config();
let cmdArgs = process.argv;
let cwd = process.cwd();

let action = cmdArgs[2];

let args = {};

cmdArgs
  .filter((e) => e.substring(0, 2) == "--")
  .forEach((e) => {
    let spl = e.split("=");
    let p = spl[0].substring(2);
    args[p] = spl[1].replaceAll(RegExp('^"|"$', "g"), "");
  });

console.log({
  action,
  args,
});

let proc;

let waitForExit = () => {
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);

  proc.on("exit", (code) => {
    console.log(`Child exited with code ${code}`);
    process.exit();
  });
};

switch (action) {
  case "build":
    proc = spawn("docker", ["build", "-t", `financeapp:${args.ver}`, "."]);
    waitForExit();
    break;

  case "run":
    proc = spawn("docker", [
      "run",
      "--rm",
      "-p",
      "3000:8080",
      "--mount",
      "type=bind,dst=/app/wwwroot,src=/D/Users/adolf/source/repos/ArFinanceApp/FinanceProject/wwwroot/,readonly",
      `financeapp:${args.ver}`,
    ]);
    waitForExit();

    break;
  case "push":
    if (!process.env.storage_key) {
      console.error("storage_key is not found in .env!");
      break;
    }
    console.info(
      [
        "azcopy",
        "copy",
        "./dist/*",
        `"https://financeappstore.file.core.windows.net/financeapp/wwwroot/finance?${process.env.storage_key}"`,
        "--recursive",
      ].join(" "),
    );
    proc = spawn("azcopy", [
      "copy",
      "./dist/*",
      `https://financeappstore.file.core.windows.net/financeapp/wwwroot/finance?${process.env.storage_key}`,
      "--recursive",
    ]);
    waitForExit();

    break;

  default:
    process.exit();
}

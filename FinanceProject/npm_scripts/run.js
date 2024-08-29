

const { spawn } = require('node:child_process');
let cmdArgs = process.argv
let cwd = process.cwd()


let action = cmdArgs[2]

let args = {}

cmdArgs.filter(e => e.substring(0, 2) == "--").forEach((e) => {
    let spl = e.split("=");
    let p = spl[0].substring(2);
    args[p] = spl[1].replaceAll(RegExp("^\"|\"$", "g"), "");
});



console.log({
    action,
    args
})

let proc

    let waitForExit = () => {

        proc.stdout.pipe(process.stdout)
        proc.stderr.pipe(process.stderr)

        proc.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
            process.exit()
        }); 
    }

switch (action) {
    case "build":
        proc = spawn("docker", ["build", "-t", `financeapp:${args.ver}`, "."])
        waitForExit()
        break;

    case "run":
        proc = spawn("docker", ["run", "--rm", "-p", "3000:8080", "--mount", "type=bind,dst=/app/wwwroot,src=/D/Users/adolf/source/repos/ArFinanceApp/FinanceProject/wwwroot/,readonly", `financeapp:${args.ver}`])
        waitForExit()

        break;
    case "push":
        let thisProcess = new Promise((res, rej) => {
            console.info(["docker", "tag", `financeapp:${args.ver}`, `ghcr.io/adolf94/financeapp:${args.ver}`, "."].join(" "))
            let build = spawn("docker", ["tag", `financeapp:${args.ver}`, `ghcr.io/adolf94/financeapp:${args.ver}`])
            build.stdout.pipe(process.stdout)
            build.stderr.pipe(process.stderr)
            build.on('exit', (code) => {
                console.log(`Child exited with code ${code}`);
                if (code == 0) {
                    res("ok")
                } else {
                    rej("not ok")
                }
            });
        }).then(() => {
            console.info(["docker","push", `ghcr.io/adolf94/financeapp:${args.ver}`].join(" "))
            let push = spawn("docker", ["push", `ghcr.io/adolf94/financeapp:${args.ver}`])
            push.stdout.pipe(process.stdout)
            push.stderr.pipe(process.stderr)
            push.on('exit', (code) => {
                console.log(`Child exited with code ${code}`);
                process.exit()
            });
        });

        break;

    default:
        process.exit()
}


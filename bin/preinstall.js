const fs = require('fs')
const resolve = require('path').resolve
const join = require('path').join
const cp = require('child_process')
const exec = cp.exec;

// get library path
var lib = resolve(__dirname, '../lib/')

fs.readdirSync(lib)
    .forEach(function (mod) {
        var modPath = join(lib, mod)

        // ensure path has package.json
        if (!fs.existsSync(join(modPath, 'package.json'))) return

        // install folder
        cp.spawn('npm', ['i'], { env: process.env, cwd: modPath, stdio: 'inherit' })
    })

exec('mkdir node_modules')

if(!fs.existsSync('./node_modules/modules')){
    exec('cd node_modules && ln -sf ../lib modules', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
}

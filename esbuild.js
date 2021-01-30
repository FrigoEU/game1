const http = require("http");
const fs = require('fs');
const path = require("path");

const esbuild = require("esbuild");
const myArgs = process.argv.slice(2);

const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  sourcemap: false,
  loader: {
    '.png': 'file',
    '.glb': 'file',
    '.jpg': 'file'
  },
  outdir: 'public'
};

function log(a){
  console.log(a);
}


if (myArgs.includes("--serve")) {
  esbuild.serve({
    port: 8000,
    onRequest: (a) => {
      // console.log("serving: " + a.path + ": " + a.status);
    }
  }, buildOptions).then(esbuild_server => {
      const mime = {
        '.html': 'text/html',
        '.css': 'text/css',
      };

    // small reverse proxy so everything goes through 8080
      const htmlServer = http.createServer((req, res) => {
        const filename = req.url && req.url !== '/' ? req.url : 'index.html';
        const publicPath = path.resolve(path.join("./public/", filename));

        log(publicPath);

        // if the requested resource exists in /public -> serve with correct mime
        if (fs.existsSync(publicPath)) {
          const stream = fs.createReadStream(publicPath);
          stream.on('ready', () => {
            const type = mime[path.parse(filename).ext] || 'application/octet-stream';
            log(`${req.method} ${req.url} => 200 ${type}`);
            res.writeHead(200, { 'content-type': type });
            stream.pipe(res);
          });
          stream.on('error', err => {
            log(`${req.method} ${req.url} => 500 ${filename} ${err.name}`);
            res.writeHead(500, err.name);
            res.end(JSON.stringify(err));
          });
        }
        // if it doesn't exist -> forward to esbuild server
        else {
          const reqProxy = http.request({ path: req.url, port: 8000 });
          reqProxy.on('response', resProxy => {
            const type = resProxy.headers['content-type'];
            log(`${req.method} ${req.url} => ${resProxy.statusCode} ${type} via esbuild`);
            res.writeHead(resProxy.statusCode, { 'content-type': type });
            resProxy.pipe(res);
          });
          req.pipe(reqProxy);
        }
      });

      htmlServer.listen(8080, err => {
        if (err) throw err;
        log('Serving /public and esbuild on http://localhost:8080');
      });

    function exit(){
      esbuild_server.stop();
      htmlServer.close();
      process.exit();
    };

    //do something when app is closing
    process.on('exit', exit);

    //catches ctrl+c event
    process.on('SIGINT', exit);

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exit);
    process.on('SIGUSR2', exit);

    //catches uncaught exceptions
    // process.on('uncaughtException', exit);
  });

} else {
  esbuild.build(buildOptions).catch(() => process.exit(1));
}


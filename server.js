const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cluster = require('cluster');
const os = require('os');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Use fewer workers to avoid resource issues
const numCPUs = Math.min(os.cpus().length, 4);

if (cluster.isPrimary && !dev) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // Disable turbopack in production cluster mode
  const app = next({ 
    dev, 
    hostname, 
    port,
    turbo: false // Disable turbopack for cluster mode
  });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    })
      .once('error', (err) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(
          `> Worker ${process.pid} ready on http://${hostname}:${port}`
        );
      });
  });
}

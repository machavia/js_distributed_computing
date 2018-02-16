#!/usr/bin/env node

var fs = require('fs')
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

try {
    // just a small setup to use as many cpus as we decide
    let setupContent = fs.readFileSync('cluster_setup.json');
    let setup = JSON.parse(setupContent);
    if(typeof(setup.cpu_count) === 'number' && setup.cpu_count !== -1){
        numCPUs = setup.cpu_count;
        console.log('setting numCPUs at', numCPUs);
    }
}
catch(e){
    console.log('could not read the cluster_setup file setting max cpu count');
    console.log('original error', e);
}

if (cluster.isMaster) {

    cluster.setupMaster({
        exec: 'bin/www'
    });

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('listening', function (worker, address) {
        console.log('Worker id: ' + worker.id + ' listening at: ' + JSON.stringify(address));
    });

    Object.keys(cluster.workers).forEach(function (id) {
        console.log('Worker id: ' + id + ' with pid: ' + cluster.workers[id].process.pid);
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died: Respawning...');
        cluster.fork();
    });
}

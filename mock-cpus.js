const os = require('os');
const originalCpus = os.cpus;
os.cpus = () => {
  return [{ model: 'mock-1-cpu', speed: 2000, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }];
};

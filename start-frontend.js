const { exec } = require('child_process');

process.env.PORT = 4000;
exec('react-scripts start', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

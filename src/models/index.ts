var fs = require("fs");
console.log("IMPORTINg models");
fs.readdir(__dirname, function (err: any, files: [string]) {
  /** Import all files for defining models */
  files.forEach(function (fileName: string) {
    if (fileName.indexOf(".js.map") === -1 && fileName !== "index.ts")
      require(`./${fileName}`);
  });
});

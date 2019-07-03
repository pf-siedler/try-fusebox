const { src, exec } = require("fuse-box/sparky");
const { FuseBox } = require("fuse-box");

const fuse = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js",
    target: "browser@es5",
    sourceMaps: { vendor: true, inline: true },
});

src(["index.html", "favicon.ico"], { base: "public" })
    .dest("dist")
    .exec();

fuse.dev({ port: 8888, hmr: true });

fuse.bundle("app")
    .instructions(`> index.ts`)
    .watch()
    .hmr({ reload: true });

fuse.run();

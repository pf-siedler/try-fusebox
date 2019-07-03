const { FuseBox } = require("fuse-box");

const fuse = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js",
    target: "browser@es5",
    sourceMaps: { vendor: true, inline: true },
});

fuse.dev({ port: 8888, hmr: true });

fuse.bundle("app")
    .instructions(`> index.ts`)
    .watch()
    .hmr();

fuse.run();

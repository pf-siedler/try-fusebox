const { FuseBox } = require("fuse-box");

const fuse = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js",
    target: "browser@es5",
    sourceMaps: { vendor: true, inline: true },
});

fuse.bundle("app").instructions(`> index.ts`);

fuse.run();

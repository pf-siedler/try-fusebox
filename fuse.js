const { FuseBox, WebIndexPlugin, StylusPlugin, CSSPlugin } = require("fuse-box");

const fuse = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js",
    target: "browser@es5",
    sourceMaps: { vendor: true, inline: true },
    plugins: [[StylusPlugin(), CSSPlugin()], WebIndexPlugin({ template: "src/public/template.html" })],
});

fuse.dev({ port: 8888, hmr: true });

fuse.bundle("app")
    .instructions(`> index.ts`)
    .watch()
    .hmr({ reload: true });

fuse.run();

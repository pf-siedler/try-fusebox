# FuseBoxを使ってみる

[FuseBox](https://github.com/fuse-box/fuse-box)というイケてるモジュールバンドラーがあるらしいので使ってみる.

## どこらへんがイケてるのか

- 早い
- デフォルトでTypeScriptに対応している
- devサーバーが用意されている
- HMRがサポートされている
- configファイルがわりと簡素

らしい

## 実際に使ってみた

公式ページに乗っているconfigファイルをちょっと書き換えて`fuse.js`の名前で保存する。
これをnodeコマンドで読み込めば実行されるらしい。`webpack-cli`みたいな専用のCLIアプリをインストールする必要がない点は個人的には好き。

```js
// fuse.js
const { FuseBox } = require("fuse-box");

const fuse = FuseBox.init({ // initの引数の型はd.tsが準備されてるので結構書きやすい
  homeDir: "src",
  output: "dist/$name.js",
  target: "browser@es5", // es5で出力してみる
  sourceMaps: { inline: true, vendor: true }, // inlineSourceあり、ブラウザ対応ありにしておく
});

fuse.bundle("app").instructions(`> index.ts`);

fuse.run();
```

srcディレクトリに適当なtsファイル`index.ts`を入れておく。

```ts
// index.ts
// 適当にES6やTypeScriptの機能が入ったコードを書く

enum LogLevel {
    Info,
    Error,
}
type Message = { type: LogLevel; message: string };

const showMessage = (m: Message): string => {
    switch (m.type) {
        case LogLevel.Info:
            return `📢 ${m.message}`;
        case LogLevel.Error:
            return `⚠️ ${m.message}`;
        default:
            throw new Error("invalid message");
    }
};

const hello: Message = { type: LogLevel.Info, message: "Hello World" };
document.querySelector("body").innerHTML = showMessage(hello);
```

```shell
node fuse
```

`dist/app.js`と`dist/app.js`が出力される。

```js
// app.js の一部

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Info"] = 0] = "Info";
    LogLevel[LogLevel["Error"] = 1] = "Error";
})(LogLevel || (LogLevel = {}));
var showMessage = function (m) {
    switch (m.type) {
        case LogLevel.Info:
            return "\uD83D\uDCE2\u00A0" + m.message;
        case LogLevel.Error:
            return "\u26A0\uFE0F " + m.message;
        default:
            throw new Error("invalid message");
    }
};
```

いい感じにES5に置き換えられてる。

`tsconfig`を定義していない場合、src以下に自動生成される。

```json
// FuseBoxが自動生成したやつ

{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES5",
    "sourceMap": true,
    "inlineSources": true,
    "jsx": "react",
    "baseUrl": ".",
    "importHelpers": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

`target`等の諸々の設定がfuse.js通りなってるので、最初にfuse.js書いてtsconfigを生成してもらう使い方もできそう？

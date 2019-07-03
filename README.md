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
また、`.fusebox`というcacheファイルも生成される（ファイルを更新したのに反映されない的な不具合があったらコレを消すとよさそう）

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

## devサーバーを使う

まず`dist/index.html`を用意します

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <script src="./app.js"></script>
</body>
</html>
```

`fuse.js`にdevを入れます

```js
fuse.dev({
    port: 8888 // port番号。デフォルトは4444。
});

fuse.bundle("app")
    .instructions(`> index.ts`)
    .watch() // tsを書き換えるたびに差分コンパイルを行う
    .hmr(); // hot module replacementを有効にする
```

[http://localhost:8888](http://localhost:8888)にアクセスすると「📢 Hello World」が表示されます。
devサーバーはoutputディレクトリをルートするので、distに`index.html`とか`favicon.ico`とかを入れておくと自動的に読み込まれます。

> つまづきポイント
> fuse.bundle()より後ろの行でfuse.dev({ports:8888})を呼んだところ、
> HMRの接続先がws://localhost:4444になって動かなかった

HMRが有効なのでブラウザの再読込を押さなくても変更が画面に反映されます。

## TSXにも対応してるんだって

react等で使われているjsx記法にも対応している。
実際に使ってみる。今回は私が使い慣れているのでsnabbdom-pragmaというJSXライブラリを用いる。

```shell
yarn add snabbdom snabbdom-pragma
```

適当にtsx記法で書かれたソースコードを用意します。

```tsx
import * as SnabbdomPragma from "snabbdom-pragma";

export function view(URL: string) {
    return (
        <div>
            <h1>Hello World</h1>
            <p>This page is written by snabbdom-pragma</p>
            <p>{URL}</p>
        </div>
    );
}
```

`index.ts`でこいつを読み取って、ブラウザに表示させます。

```ts
import * as snabbdom from "snabbdom";
import { view } from "./view";

const patch = snabbdom.init([]);
patch(document.querySelector("#app"), view(window.location.href));
```

動く。

## 静的ファイルのコピー

index.htmlをdistに置くのがなんか気持ち悪いので、publicディレクトリに入れて、実行時にdistにコピーするようにしたい
ついでにfaviconとかも適当に使ってみる（https://favicon.io/favicon-generator/）

```js
src(["index.html", "favicon.ico"], { base: "public" })
    .dest("dist")
    .exec();
```

## Pluginを使えばindex.htmlを用意する必要も無いんです！

↑でやる必要はなくて、WebIndexPluginを使うといい感じのindex.htmlを勝手に作ってくれる

```js
const fuse = FuseBox.init({
    // 中略
    plugins: [WebIndexPlugin({ title: "My Page" })],
});
```

distにindex.htmlができてる。（インデントがめちゃくちゃなのはご愛嬌）

これだと`div#app`がなくて動かない。
テンプレートからhtmlを作る方法もあるらしい。
scriptタグを入れてほしい箇所に`$bundles`と書いたhtmlファイルを用意する。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>My Page</title>
</head>
<body>
  <div id="app"></div>
  $bundles
</body>
</html>
```

```js
    plugins: [WebIndexPlugin({ template: "public/template.html" })],
```

これでいい感じに動く

## cssを使う

cssもいじる。最近はAltCSSが使われることが多い。私も業務ではstylusを使っている。
FuseBoxにはだいたいのAltCSS用のpluginがデフォルトで用意されている。

```js
    plugins: [[StylusPlugin(), CSSPlugin()], WebIndexPlugin({ template: "src/public/template.html" })],
```

適当にstylusファイルを作る

```styl
// sub.styl
$myColor = #ff0000

// main.styl
@import "sub.styl";

h1
  color $myColor
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>My Page</title>
</head>
$css
<body>
  <div id="app"></div>
  $bundles
</body>
</html>
```

スタイルが適応される。これはcssファイルを書き出すのではなく、htmlにinlineでstyleを書き込むらしい（ココらへんはconfigで変えられそうだけど）。

## まとめ

とりあえず動かすところまでやった。
TSのトランスパイル周りは結構いい感じな気がする。
cssとか、今回紹介しなかったtask runner周りが絡んでくるとconfigがごちゃごちゃしてくる感じがする。
↑ドキュメントが少ないのもあいまって

速さに関して、体感時間的にはイライラするレベルで待たされることは無いとだけ言っておきます。
（ココらへんを客観的に語るなら他のモジュールバンドラーとの比較検証が必須になるけど、面倒なので。サンプルで書いたコードも短いし）

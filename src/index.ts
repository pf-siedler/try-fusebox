// 適当にES6やTypeScript固有の機能が入ったコードを書く

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

import * as SnabbdomPragma from "snabbdom-pragma";

export function view(text: string) {
    return (
        <div>
            <h1>Hello World</h1>
            <p>This page is written by snabbdom-pragma</p>
            <p>{text}</p>
        </div>
    );
}

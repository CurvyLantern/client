addEventListener("message", (event: MessageEvent<number>) => {
  postMessage("hello");
});

import { AsyncSha256 } from "./sha-256.js";

const hasher = new AsyncSha256();

onmessage = (e) => {
  const started = new Date();
  const reader = new FileReader();
  reader.onload = () => {
    const fileData = reader.result as string;
    hasher.async_digest(
      fileData,
      (hash) => {
        postMessage({
          hash: hash,
          remaining: 0,
          elapsed: new Date().getTime() - started.getTime(),
          total: fileData.length
        })
      },
      (remaining) => {
        postMessage({
          hash: null,
          remaining: remaining,
          elapsed: new Date().getTime() - started.getTime(),
          total: fileData.length
        })
      },
    );
  }
  reader.readAsText(e.data);
};

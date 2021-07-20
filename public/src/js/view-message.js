import makeRequest from "./makeRequest.js";
import parseForm from "./parseForm.js";

makeRequest("/api/message/:msgHash", "GET", options).then((res) => {
  console.log(res);
  const url = res.data.url;
});

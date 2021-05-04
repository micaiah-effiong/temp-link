import makeRequest from "./makeRequest.js";
import parseForm from "./parseForm.js";

let form = document.createMsg;
const linkView = document.querySelector("#shareLink");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log(e);
  let options = {};
  options.headers = { "Content-Type": "application/json" };
  options.body = parseForm(form);

  const actionUrl = form.action || "/api/message";

  makeRequest(actionUrl, "POST", options).then((res) => {
    console.log(res);
    const url = res.data.url;
    linkView.href = linkView.innerText = url + "/view";
  });
});

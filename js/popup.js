label = document.getElementById("label");
gl = document.getElementById("gl");
hl = document.getElementById("hl");
save_btn = document.getElementById("save_btn");

chrome.storage.sync.get(["label", "gl", "hl"], (items) => {
  label.value = items.label;
  gl.value = items.gl;
  hl.value = items.hl;
});

function isEmptyStr(str) {
  return !str.trim().length;
}

save_btn.addEventListener("click", () => {
  if (
    !isEmptyStr(label.value) &&
    !isEmptyStr(gl.value) &&
    !isEmptyStr(hl.value)
  ) {
    chrome.runtime.sendMessage({
      type: "setting_params",
      label: label.value,
      gl: gl.value,
      hl: hl.value,
    });
    document.getElementById("msg").textContent = "OK";
  } else {
    document.getElementById("msg").textContent = "ERR";
  }
});

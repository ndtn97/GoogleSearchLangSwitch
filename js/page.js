stats_html = document.getElementById("result-stats").innerHTML;
toggle_btn_html = `
<span>EN <label class="cl-switch cl-switch-small cl-switch-green"><input type="checkbox" id="toggle_btn"><span class="switcher">
</span></label>&nbsp;</span>
`;

document.getElementById("result-stats").innerHTML =
  toggle_btn_html + stats_html;

chrome.runtime.sendMessage({ type: "page", search: true });

toggle_btn = document.getElementById("toggle_btn");
toggle_btn.addEventListener("change", () => {
  chrome.runtime.sendMessage({ type: "switch", enable: toggle_btn.checked });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  tab = sender.tab;
  thisExtensionId = chrome.runtime.id;
  sendExtensionId = sender.id;

  if (thisExtensionId == sendExtensionId) {
    if (request.type == "switch_stat") {
      toggle_btn.checked = request.enabled;
    }
  }
});

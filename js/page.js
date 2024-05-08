btn_html = `
<span id="sw_label"></span>&nbsp;<label class="cl-switch cl-switch-small cl-switch-green"><input type="checkbox" id="toggle_btn"><span class="switcher"></span></label>&nbsp;
`;

function postProcess() {
  chrome.storage.sync.get(["label"], (items) => {
    document.getElementById("sw_label").textContent = items.label;
  });

  chrome.runtime.sendMessage({ type: "page" });

  toggle_btn = document.getElementById("toggle_btn");
  toggle_btn.addEventListener("change", () => {
    chrome.runtime.sendMessage({ type: "switch", enable: toggle_btn.checked });
  });
}

function injectSwitchToStat() {
  if (document.getElementById("sw_label") == null) {
    stats_html = document.getElementById("result-stats").innerHTML;
    toggle_btn_html = `<span>${btn_html}</span>`;
    document.getElementById(
      "result-stats"
    ).innerHTML = `<span>${btn_html}</span> ${stats_html}`;
    postProcess();
  }
}

function injectSwitchToNav(cls_name, btn_opt) {
  if (document.getElementById("sw_label") == null) {
    bar_html = document.getElementsByClassName(cls_name)[0].innerHTML;
    document.getElementsByClassName(
      cls_name
    )[0].innerHTML = `<div ${btn_opt}> ${btn_html} </div> ${bar_html}`;
    postProcess();
  }
}

var observer = new MutationObserver(function (mutations) {
  Array.prototype.forEach.call(mutations, function (mutation) {
    if (mutation.type === "childList") {
      Array.prototype.forEach.call(mutation.addedNodes, function (node) {
        if (node.classList && node.classList.contains("qogDvd")) {
          injectSwitchToNav("crJ18e", "");
          observer.disconnect();
        }
      });
    }
  });
});

observer.observe(document, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true,
});

// fallback
document.addEventListener("DOMContentLoaded", function () {
  injectSwitchToStat();
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

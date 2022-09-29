chrome.runtime.onInstalled.addListener(() => {
  params = {
    label: "EN",
    gl: "us",
    hl: "en",
  };
  chrome.storage.sync.get(["label", "gl", "hl"], (items) => {
    if (items.gl !== undefined) {
      params.gl = items.gl;
    }
    if (items.hl !== undefined) {
      params.hl = items.hl;
    }
    if (items.label !== undefined) {
      params.label = items.label;
    }
  });
  chrome.storage.sync.set(params);
});

rule = {
  id: 2,
  action: {
    type: "redirect",
    redirect: {
      transform: {
        queryTransform: {
          addOrReplaceParams: [
            {
              key: "gl",
              value: "us",
            },
            {
              key: "hl",
              value: "en",
            },
          ],
        },
      },
    },
  },
  condition: {
    urlFilter: "*://www.google.com/search*",
    resourceTypes: ["main_frame"],
    tabIds: [chrome.tabs.TAB_ID_NONE],
  },
};

rule_undo = {
  id: 1,
  action: {
    type: "redirect",
    redirect: {
      transform: {
        queryTransform: {
          removeParams: ["gl", "hl"],
        },
      },
    },
  },
  condition: {
    urlFilter: "*://www.google.com/search*",
    resourceTypes: ["main_frame"],
    tabIds: [chrome.tabs.TAB_ID_NONE],
  },
};

function updateRuleParams(gl, hl) {
  if (gl === undefined) {
    gl = "us";
  }
  if (hl === undefined) {
    hl = "en";
  }

  chrome.declarativeNetRequest.getSessionRules((rules) => {
    rules.forEach((rule) => {
      if (rule.id == 2) {
        params = [
          {
            key: "gl",
            value: gl,
          },
          {
            key: "hl",
            value: hl,
          },
        ];
        rule.action.redirect.transform.queryTransform.addOrReplaceParams =
          params;

        // update rule
        chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [2],
          addRules: [rule],
        });
      }
    });
  });
}

function updateToggleSwitch(tabId) {
  chrome.declarativeNetRequest.getSessionRules((rules) => {
    enabled = false;
    rules.forEach((rule) => {
      if (rule.id == 2) {
        chrome.tabs.sendMessage(tabId, {
          type: "switch_stat",
          enabled: rule.condition.tabIds.includes(tabId),
        });
      }
    });
  });
}

function getRulesAndApply() {
  chrome.storage.sync.get(["gl", "hl"], (items) => {
    updateRuleParams(items.gl, items.hl);
  });
}

function enable(tab) {
  chrome.declarativeNetRequest.getSessionRules((rules) => {
    rules.forEach((rule) => {
      if (rule.id == 2) {
        tabIds = rule.condition.tabIds;
        // already enabled -> continue
        if (!tabIds.includes(tab.id)) {
          // diabled -> enable
          rule.condition.tabIds.push(tab.id);

          // update rule
          chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: [2],
            addRules: [rule],
          });

          // reload
          chrome.tabs.reload(tab.id);
        }
      }
    });
  });
}

function disable(tab) {
  chrome.declarativeNetRequest.getSessionRules((rules) => {
    apply_rules = [];
    rules.forEach((rule) => {
      if (rule.id == 2) {
        tabIds = rule.condition.tabIds;
        // already enabled -> disable
        if (tabIds.includes(tab.id)) {
          // disable rule
          idx = tabIds.indexOf(tab.id);
          rule.condition.tabIds.splice(idx, 1);
        }
      } else {
        tabIds = rule.condition.tabIds;
        if (!tabIds.includes(tab.id)) {
          rule.condition.tabIds.push(tab.id);
        }
      }
      apply_rules.push(rule);
    });

    // update rule
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [1, 2],
      addRules: apply_rules,
    });

    // reload
    chrome.tabs.reload(tab.id);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  tab = sender.tab;
  thisExtensionId = chrome.runtime.id;
  sendExtensionId = sender.id;

  if (thisExtensionId == sendExtensionId) {
    if (request.type == "page") {
      chrome.declarativeNetRequest.getSessionRules((rules) => {
        rules.forEach((rule) => {
          if (rule.id == 1) {
            tabIds = rule.condition.tabIds;
            if (tabIds.includes(tab.id)) {
              // disable rule
              idx = tabIds.indexOf(tab.id);
              rule.condition.tabIds.splice(idx, 1);

              // update rule
              chrome.declarativeNetRequest.updateSessionRules({
                removeRuleIds: [1],
                addRules: [rule],
              });
            }
          }
        });
      });
      updateToggleSwitch(tab.id);
    }

    if (request.type == "switch") {
      if (request.enable) {
        enable(tab);
      } else {
        disable(tab);
      }
      updateToggleSwitch(tab.id);
    }

    if (request.type == "setting_params") {
      chrome.storage.sync.set(
        { label: request.label, gl: request.gl, hl: request.hl },
        () => {
          updateRuleParams(request.gl, request.hl);
        }
      );
    }
  }
});

chrome.storage.sync.onChanged.addListener((changes, areaName) => {
  getRulesAndApply();
});

// init
chrome.declarativeNetRequest.updateSessionRules({
  addRules: [rule, rule_undo],
});
getRulesAndApply();

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
    urlFilter: "google.com",
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
    urlFilter: "google.com",
    resourceTypes: ["main_frame"],
  },
};

function updateIcon(tabId, url) {
  if (url.match("google.com/search")) {
    chrome.declarativeNetRequest.getSessionRules((rules) => {
      rules.forEach((rule) => {
        if (rule.id == 2) {
          tabIds = rule.condition.tabIds;
          if (tabIds.includes(tabId)) {
            // enabled
            icon = "/images/icon_on.png";
          } else {
            // diabled
            icon = "/images/icon_off.png";
          }

          chrome.action.setIcon({
            path: icon,
          });
        }
      });
    });
  } else {
    chrome.action.setIcon({
      path: "/images/icon_disabled.png",
    });
  }
}

chrome.declarativeNetRequest.updateSessionRules({
  removeRuleIds: [2],
  addRules: [rule],
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  tab = sender.tab;
  thisExtensionId = chrome.runtime.id;
  sendExtensionId = sender.id;

  if (thisExtensionId == sendExtensionId) {
    if (request.search) {
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [1],
      });
    }
  }
  updateIcon(tab.id, tab.url);
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateIcon(activeInfo.tabId, tab.url);
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.match("google.com/search")) {
    chrome.declarativeNetRequest.getSessionRules((rules) => {
      apply_rules = [];
      rules.forEach((rule) => {
        tabIds = rule.condition.tabIds;
        // already enabled -> disable
        if (tabIds.includes(tab.id)) {
          idx = tabIds.indexOf(tab.id);
          rule.condition.tabIds.splice(idx, 1);
          apply_rules.push(rule_undo);
        } else {
          // diabled -> enable
          rule.condition.tabIds.push(tab.id);
        }
        apply_rules.push(rule);
      });

      // update rule
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [2],
        addRules: apply_rules,
      });

      // reload
      chrome.tabs.reload(tab.id);
    });
  }
});

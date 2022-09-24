rule =
{
    "id": 2,
    "action": {
        "type": "redirect",
        "redirect": {
            "transform": {
                "queryTransform": {
                    "addOrReplaceParams": [
                        {
                            "key": "gl",
                            "value": "us"
                        },
                        {
                            "key": "hl",
                            "value": "en"
                        }
                    ]
                }
            }
        }
    },
    "condition": {
        "urlFilter": "google.com",
        "resourceTypes": [
            "main_frame"
        ],
        "tabIds": [chrome.tabs.TAB_ID_NONE]
    }
}


rule_undo =
{
    "id": 1,
    "action": {
        "type": "redirect",
        "redirect": {
            "transform": {
                "queryTransform": {
                    "removeParams": ["gl", "hl"]
                }
            }
        }
    },
    "condition": {
        "urlFilter": "google.com",
        "resourceTypes": [
            "main_frame"
        ]
    }
}


chrome.declarativeNetRequest.updateSessionRules(
    {
        "removeRuleIds": [2],
        "addRules": [rule]
    }
)

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.declarativeNetRequest.updateSessionRules(
        {
            "removeRuleIds": [1]
        }
    )
});

chrome.action.onClicked.addListener(tab => {
    apply_rules = []
    undo_flag = false;
    chrome.declarativeNetRequest.getSessionRules(rules => {
        rules.forEach(rule => {
            tabIds = rule.condition.tabIds;
            // already enabled -> disable
            if (tabIds.includes(tab.id)) {
                idx = tabIds.indexOf(tab.id);
                rule.condition.tabIds.splice(idx, 1);
                apply_rules.push(rule_undo);
                undo_flag = true;
            } else { // diabled -> enable
                rule.condition.tabIds.push(tab.id);
            }
            apply_rules.push(rule);
        })
        // update rule
        uprule = chrome.declarativeNetRequest.updateSessionRules(
            {
                "removeRuleIds": [2],
                "addRules": apply_rules
            }
        )
    })

    chrome.tabs.reload(tab.id);
});

chrome.runtime.onInstalled.addListener(async () => {
    console.log("installed!")
});

function enable(tabId) {
    chrome.declarativeNetRequest.updateSessionRules(
        {
            "removeRuleIds": [2],
            "addRules": [
                {
                    "id": 1,
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
                        ]
                    }
                }
            ]
        }
    )
}

function disable(tabId) {
    chrome.declarativeNetRequest.updateSessionRules(
        {
            "removeRuleIds": [1],
            "addRules": [
                {
                    "id": 2,
                    "action": {
                        "type": "redirect",
                        "redirect": {
                            "transform": {
                                "queryTransform": {
                                    "removeParams": [
                                        "gl",
                                        "hl"
                                    ]
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
            ]
        }
    )
}

toggle = false;

chrome.action.onClicked.addListener(tab => {
    toggle = !toggle;
    if (toggle) {
        f = enable
        icon = "/images/icon_on.png"
    } else {
        f = disable
        icon = "/images/icon_off.png"
    }
    chrome.action.setIcon({
        path: icon
    })
    f(tab.id);
    chrome.tabs.reload(tab.id);
});

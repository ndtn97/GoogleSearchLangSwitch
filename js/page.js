stats_html = document.getElementById("result-stats").innerHTML
toggle_btn = `
<span>EN <label class="cl-switch cl-switch-small cl-switch-green"><input type="checkbox"><span class="switcher">
</span></label>&nbsp;</span>
`

document.getElementById("result-stats").innerHTML = toggle_btn + stats_html;

chrome.runtime.sendMessage({ search: true })

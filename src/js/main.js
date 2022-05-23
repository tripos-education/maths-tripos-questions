

var darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

darkModeQuery.addListener(function (query) {
	var theme = query.matches ? "dark" : "light";
	setTheme(theme);
});

window.setTheme = function (theme) {
	document.documentElement.setAttribute("data-theme", theme);
	sendMessage ({ setConfig: {theme: theme} });
	localStorage.setItem("theme",theme);
};

// additional script to align the giscus theme to the page theme
function sendMessage(message) {
  const iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe) return;
  iframe.contentWindow.postMessage({ giscus: message }, iframe.src);
}

function setThemeByLS () {
	if (localStorage.getItem("theme") == "dark" || localStorage.getItem("theme") == "light") {
		setTheme(localStorage.getItem("theme"));
	}
}
setThemeByLS();


window.onfocus = function(e){
	setThemeByLS();
}

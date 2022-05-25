

const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

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

function setThemeInitial () {
	var initialTheme = localStorage.getItem("theme");
	if ( initialTheme == "dark" || initialTheme == "light") {
		setTheme(initialTheme);
	} else {
		if (darkModeQuery.matches) {
			initialTheme = "dark";
		} else {
			initialTheme = "light";
		}
	}
	document.querySelector("script.giscus-script").setAttribute("data-theme",initialTheme);
}

setThemeInitial();


window.onfocus = function(e){
	setThemeInitial();
}

toggleSwitch.addEventListener('change', function (e) {
	if (e.target.checked) {
		setTheme("dark");
	} else {
		setTheme("light");
	}
},false);
import * as urlHelper from "../src/urlHelper.js";

const pageContainerElem = document.getElementById("pageContainer");

navigator.serviceWorker.register("/dbServiceWorker.js").then(registration => {
    console.log(`Service worker spawned on ${registration.scope}`);
}).catch(err => {
    globals.handleError(err);
});

const handleNavigation = () => {
    const params = urlHelper.getParams();
    let currentPage = "";
    if (pageContainerElem.hasChildNodes()) {
        currentPage = pageContainerElem.firstChild.tagName.toLowerCase().split("-")[0];
    }
    if (currentPage !== params.page) {
        while (pageContainerElem.hasChildNodes()) {
            pageContainerElem.removeChild(pageContainerElem.lastChild);
        }
        const newPage = document.createElement(`${params.page}-page`)
        pageContainerElem.appendChild(newPage);
    }
};

const initialParams = urlHelper.getParams();
urlHelper.setParams({
    page: "loading",
}, true);
const loadingPage = document.createElement("loading-page");
loadingPage.addEventListener("loaded", ()=> {
    window.addEventListener("urlUpdated", handleNavigation);
    if (initialParams.page === "loading") {
        initialParams.page = "search";
    }
    setTimeout(() => {
        urlHelper.setParams(initialParams);
    }, 1);
});
pageContainerElem.appendChild(loadingPage);


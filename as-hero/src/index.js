import * as urlHelper from "../src/urlHelper.js";

const pageContainerElem = document.getElementById("pageContainer");

navigator.serviceWorker.register("./dbServiceWorker.js").then(registration => {
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
        const newPage = document.createElement(`${params.page}-page`);
        pageContainerElem.appendChild(newPage);
    }
};

const initialParams = urlHelper.getParams();
urlHelper.setParams({
    page: "loading",
}, true);
const loadingPage = document.createElement("loading-page");
loadingPage.addEventListener("loaded", () => {
    window.addEventListener("urlUpdated", handleNavigation);
    if (initialParams.page === "loading") {
        initialParams.page = "search";
    }
    setTimeout(() => {
        urlHelper.setParams(initialParams);
    }, 1);
});
pageContainerElem.appendChild(loadingPage);

// TODO: look at a different way of managing modals
// this pattern encourages you to hold onto references to modals, but provides no way of notifying you
// to release that reference when the modal is closed so it can be garbage collected
const modalContainerElem = document.getElementById("modalLayer");
let activeModals = [];
modalContainerElem.addEventListener("pointerdown", event => {
    if (activeModals.length) {
        globals.clearModals();
    }
});

globals.addModal = modal => {
    modalContainerElem.appendChild(modal);
    activeModals.push(modal);
    modalContainerElem.classList.add("occupied");
};

globals.clearModals = () => {
    while (modalContainerElem.hasChildNodes()) {
        modalContainerElem.removeChild(modalContainerElem.lastChild);
    }
    activeModals = [];
    modalContainerElem.classList.remove("occupied");
};

globals.removeModal = modal => {
    const modalIndex = activeModals.indexOf(modal);
    if (modalIndex !== -1) {
        activeModals.splice(modalIndex, 1);
    }
    modalContainerElem.removeChild(modal);
    if (!activeModals.length) {
        modalContainerElem.classList.remove("occupied");
    }
};

globals.getModals = () => [...activeModals];
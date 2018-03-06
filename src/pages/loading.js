
const template = document.createElement("template");
template.innerHTML = `
    <style>
    #loadingContainer {
        display: flex;
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;
        transition: opacity 0.3s;
    }
    #loadingContainer.hidden {
        opacity: 0;
    }

    #progressIndicator {
        font-size: 64px;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(-360deg);
        }
    }

    #spinner {
        width: 64px;
        animation: spin 1500ms linear infinite;
    }
    </style>
    <div id="loadingContainer">
        <vpl-label  id="progressIndicator" prefix="Loading 0%">
            <img src="/assets/spinner.svg" id="spinner" slot="content"></img>
        </vpl-label>
    </div>
`;

export default class rosterPage extends HTMLElement {
    static get template() {
      return template;
    }

    static get observedAttributes() {
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.loadingContainerElem = this.shadowRoot.getElementById("loadingContainer");
        this.progressIndicatorElem = this.shadowRoot.getElementById("progressIndicator");
        this.updateLoadStatus();
    }

    async updateLoadStatus() {
        try {
            const response = await window.fetch("/sw-loadStatus");
            const body = await response.text();
            
            if (response.status !== 404) {
                if (parseInt(body) === 1) {
                    this.progressIndicatorElem.prefix = "Loading 100%";
                    this.loadingContainerElem.classList.add("hidden");
                    this.dispatchEvent(new CustomEvent("loaded"));
                }
                else {
                    this.progressIndicatorElem.prefix = `Loading ${Math.floor(parseFloat(body || 0) * 100)}%`;
                    setTimeout(() => {
                        this.updateLoadStatus();
                    }, 100);
                }
            }
            else {
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            }
        }
        catch (err) {
            globals.handleError(err);
        }
    }
}

customElements.define("loading-page", rosterPage);
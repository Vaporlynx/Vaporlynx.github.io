import * as urlHelper from "../../src/urlHelper.js";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            font-size: 16px;
        }
    
        #mechContainer {
            display: flex;
            flex-direction: column;
            flex-wrap:wrap 
        }
        #mechContainer > * {
            margin-top: 10px;
        }


        #searchContainer {
            height: 22px;
            width: 50%;
            display: flex;
        }
        #searchContainer>* {
            font-size: 24px;
        }

        #label {
            font-size: 24px;
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
            animation: spin 1500ms linear infinite;
            opacity: 0;
            transition: opacity 0.3s;
        }

        #spinner.show {
            opacity: 0.8;
        }

        #unitName {
            width: 100%;
            height: 100%;
        }
    </style>

    <vpl-label prefix="Mech Name:" id="label">
    <div slot="content" id="searchContainer">
        <input type="text" id="unitName"></input>
        <img src="/assets/spinner.svg" id="spinner"></img>
    </div>
    </vpl-label>
    <div id="mechContainer"> </div>
`;

export default class searchPage extends HTMLElement {
    static get template() {
      return template;
    }

    static get observedAttributes() {
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.unitNameElem = this.shadowRoot.getElementById("unitName");
        this.mechContainerElem = this.shadowRoot.getElementById("mechContainer");
        this.spinnerElem = this.shadowRoot.getElementById("spinner");

        this.unitNameElem.addEventListener("keypress", async event => {
            if (event.key ===  "Enter") {
                this.searchUnit(this.unitNameElem.value);
            }
        });
    }

    connectedCallback() {
        if (urlHelper.getParams().unitName) {
            this.searchUnit(this.unitNameElem.value = urlHelper.consumeParams(["unitName"]).unitName);
        }
    }

    async searchUnit(name) {
        this.spinnerElem.classList.add("show");
        while (this.mechContainerElem.hasChildNodes()) {
            this.mechContainerElem.removeChild(this.mechContainerElem.lastChild);
        }
        try {
            const unitName = name;
            urlHelper.setParams({unitName});
            const unParsed = await window.fetch(`/sw-units?name=${unitName}`);
            this.spinnerElem.classList.remove("show");
            const data = JSON.parse(await unParsed.text());
            for (const unit of data) {
                const card = document.createElement("unit-card");
                card.data = unit;
                card.addEventListener("pointerdown", () => {
                    this.addUnit(card.data.id);
                });
                this.mechContainerElem.appendChild(card);
            }
        }
        catch (err) {
            global.handleError(`Error getting unit: ${err}`);
        }
    }

    addUnit(id) {
        const params = urlHelper.getParams();
        const unitIds = params.unitIds ? params.unitIds.split(",") : [];
        unitIds.push(id);
        urlHelper.setParams({unitIds: unitIds.join(",")});
    }
}

customElements.define("search-page", searchPage);
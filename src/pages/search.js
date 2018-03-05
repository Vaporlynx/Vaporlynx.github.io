import * as router from "../../src/router.js";

const template = document.createElement("template");
template.innerHTML = `
    <style>
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
            width: 180px;
            display: flex;
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
    </style>

    <vpl-label prefix="Mech Name:">
    <div slot="content" id="searchContainer">
        <input type="text" id="mechName"></input>
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

        this.mechNameElem = this.shadowRoot.getElementById("mechName");
        this.mechContainerElem = this.shadowRoot.getElementById("mechContainer");
        this.spinnerElem = this.shadowRoot.getElementById("spinner");

        if (router.getParams().unitName) {
            this.searchUnit(this.mechNameElem.value = router.consumeParams(["unitName"]).unitName);
        }

        this.mechNameElem.addEventListener("keypress", async event => {
            if (event.key ===  "Enter") {
                this.searchUnit(this.mechNameElem.value);
            }
        });
    }

    async searchUnit(name) {
        this.spinnerElem.classList.add("show");
        while (this.mechContainerElem.hasChildNodes()) {
            this.mechContainerElem.removeChild(this.mechContainerElem.lastChild);
        }
        try {
            const unitName = name;
            router.setParams({unitName});
            const unParsed = await window.fetch(`/sw-units?name=${unitName}`);
            this.spinnerElem.classList.remove("show");
            const data = JSON.parse(await unParsed.text());
            for (const unit of data) {
                const card = document.createElement("unit-card");
                card.data = unit;
                this.mechContainerElem.appendChild(card);
            }
        }
        catch (err) {
            global.handleError(`Error getting unit: ${err}`);
        }
    }
}

customElements.define("search-page", searchPage);
import * as urlHelper from "../../src/urlHelper.js";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        #roster {
            display: flex;
            width: 100vw;
            height: 100vh;
            overflow: auto;
            flex-wrap: wrap;
        }

        #roster > unit-card {
            margin: 5px;
        }
    </style>

    <div id="roster"> </div>
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

        this.rosterElem = this.shadowRoot.getElementById("roster");

        window.addEventListener("urlUpdated", async event => {
            this.buildRoster(this.getIdsFromUrl());
        });
        this.buildRoster(this.getIdsFromUrl());
    }

    getIdsFromUrl() {
        if (urlHelper.getParams().unitIds) {
            return urlHelper.consumeParams(["unitIds"]).unitIds.split(",").map(id => parseInt(id))
        }
        return [];
    }

    async buildRoster(ids) {
        while (this.rosterElem.hasChildNodes()) {
            this.rosterElem.removeChild(this.rosterElem.lastChild);
        }
        if (ids.length) {
            try {
                const unParsed = await window.fetch(`/sw-units?unitIds=${ids.join(",")}`);
                const data = JSON.parse(await unParsed.text());
                for (const unit of data) {
                    const card = document.createElement("unit-card");
                    card.data = unit;
                    this.rosterElem.appendChild(card);
                }
            }
            catch (err) {
                global.handleError(`Error getting unit: ${err}`);
            }
        } 
    }
}

customElements.define("roster-page", rosterPage);
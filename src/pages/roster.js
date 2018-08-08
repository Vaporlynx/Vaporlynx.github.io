import * as urlHelper from "../../src/urlHelper.js";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: grid;
            grid-template: 32px / 1fr;
            grid-template-areas: "controls"
                                "roster";
            overflow: hidden;
            height: 100vh;
            width: 100vw;

            --cardRows: 1;
            --cardSizeOffset: 0.9;
        }

        #controls {
            grid-area: controls;
            display: flex;
        }

        #roster {
            display: flex;
            width: 100vw;
            height: 100vh;
            overflow: auto;
            flex-wrap: wrap;
            grid-area: roster;
        }

        #roster > unit-card {
            margin: 5px;
            width: calc(100vw / var(--cardRows) * var(--cardSizeOffset));
            height: calc(71.42vw / var(--cardRows) * var(--cardSizeOffset));
            position: relative;
            font-size: calc(2vw / var(--cardRows) * var(--cardSizeOffset));
            --pipSize: calc(2vw / var(--cardRows) * var(--cardSizeOffset));
            --bevelOffset: calc(2.5vw / var(--cardRows) * var(--cardSizeOffset));
        }
    </style>

    <div id="controls">
        <button id="search">Search</button>
        <vpl-label prefix="Number of columns:" id="label">
        <input type="number" id="columnCount" value="1" min="1" max="5" slot="content"/>
    </div>
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
        this.handleUrlUpdated = event => {
            this.buildRoster(this.getIdsFromUrl());
        };
        this.buildRoster(this.getIdsFromUrl());


        this.searchElem = this.shadowRoot.getElementById("search");
        this.searchElem.addEventListener("pointerdown", event => {
            urlHelper.setParams({
                page: "search",
            });
        });

        // TODO: get the available screen size and use that to calculate how big the cards should be.
        this.columnCountElem = this.shadowRoot.getElementById("columnCount");
        this.columnCountElem.addEventListener("change", event => {
            this.style.setProperty("--cardRows", this.columnCountElem.value);
        });
        window.onbeforeunload = () => "Are you sure you want to clear this page?";
    }

    connectedCallback() {
        window.addEventListener("urlUpdated", this.handleUrlUpdated);
    }

    disconnectedCallback() {
        window.removeEventListener("urlUpdated", this.handleUrlUpdated);
    }

    getIdsFromUrl() {
        if (urlHelper.getParams().unitIds) {
            return urlHelper.getParams(["unitIds"]).unitIds.split(",").map(id => parseInt(id));
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
                globals.handleError(`Error getting unit: ${err}`);
            }
        }
    }
}

customElements.define("roster-page", rosterPage);
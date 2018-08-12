import * as urlHelper from "../../src/urlHelper.js";
import * as unitHelper from "../../src/unitHelper.js";
// TODO: decide if navigation should be handled by the individual panels, or if it should be hoisted up to the index

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            font-size: 16px;
            display: grid;
            grid-template: 32px / 1fr;
            grid-template-areas: "controls"
                                 "units";
            overflow: hidden;
            height: 100vh;
            width: 100vw;
        }

        .spacedRow {
            display: flex;
            flex-direction: row;
        }
    
        .spacedColumn {
            display: flex;
            flex-direction: column;
        }

        #controls {
            grid-area: controls;
            display: flex;
        }
    
        #mechContainer {
            grid-area: units;
            overflow: auto;
        }
        #mechContainer > * {
            margin-bottom: 24px;
        }

        #searchContainer {
            height: 32px;
            width: 50%;
            display: flex;
        }
        #searchContainer>* {
            font-size: 32px;
        }

        #label {
            font-size: 32px;
            margin-bottom: 12px;
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
            background-color: #6d6d6d;
            border: none;
            color: #dadada;
        }

        .cardContainer {
            <!--7:5 width to height-->
            width: 100vw;
            height: 71.42vw;
            position: relative;
            font-size: 2vw;
        }

        unit-card {
            --pipSize: 2vw;
            --bevelOffset: 2.5vw;
        }
        
        vpl-add-remove-units {
            z-index: 1;
        }
    </style>
    <div id="controls">
        <vpl-label prefix="Mech Name:" id="label">
            <div slot="content" id="searchContainer">
                <input type="text" id="unitName"></input>
                <img src="/assets/spinner.svg" id="spinner"></img>
            </div>
        </vpl-label>
        <button id="roster">Roster</button>
        <button id="clear">Clear Roster</button>
    </div>
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
        this.rosterElem = this.shadowRoot.getElementById("roster");
        this.rosterElem.addEventListener("pointerdown", event => {
            urlHelper.setParams({
                page: "roster",
            });
        });

        this.clearElem = this.shadowRoot.getElementById("clear");
        this.clearElem.addEventListener("pointerdown", event => {
            urlHelper.consumeParams(["units"]);
        });

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
                const addRemoveUnitsElem = document.createElement("vpl-add-remove-units");
                addRemoveUnitsElem.addEventListener("add", event => {
                    this.addUnit(unit);
                });
                const cardContainer = document.createElement("div");
                addRemoveUnitsElem.addEventListener("remove", event => {
                    this.removeUnit(unit.id);
                });
                cardContainer.classList.add("cardContainer");
                cardContainer.appendChild(addRemoveUnitsElem);
                cardContainer.appendChild(card);
                this.mechContainerElem.appendChild(cardContainer);
            }
        }
        catch (err) {
            globals.handleError(`Error getting unit: ${err}`);
        }
    }

    addUnit(unit) {
        const params = urlHelper.getParams();
        const units = params.units ? params.units.split(",").map(i => unitHelper.decode(i)) : [];
        units.push(unit);
        urlHelper.setParams({units: units.map(i => unitHelper.encode(i)).join(",")});
    }

    removeUnit(id) {
        const params = urlHelper.getParams();
        const units = params.units ? params.units.split(",").map(i => unitHelper.decode(i)) : [];
        const firstIndex = units.findIndex(i => i.id === id);
        if (firstIndex !== -1) {
            units.splice(firstIndex, 1);
        }
        urlHelper.setParams({units: units.map(i => unitHelper.encode(i)).join(",")});
    }
}

customElements.define("search-page", searchPage);
import * as urlHelper from "../../src/urlHelper.js";
import * as unitHelper from "../../src/unitHelper.js";
// TODO: decide if navigation should be handled by the individual panels, or if it should be hoisted up to the index


const advancedParams = [
    "minPV",
    "maxPV",
    "minPD",
    "maxPD",
    "techLevels",
    "sizes",
    "specials",
];
const sizeParams = [
    {name: "Light", id: 1},
    {name: "Medium", id: 2},
    {name: "Heavy", id: 3},
    {name: "Assault", id: 4},
];
const techLevelParams = [
    {name: "InnerSphere", id: 1},
    {name: "Clan", id: 2},
    {name: "Mixed", id: 3},
    {name: "Primitive", id: 4},
];

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
            position: relative;
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

        #basicControls {
            height: 100%;
        }

        #advancedControls {
            z-index: 2;
            position: absolute;
            top: 100%;
            background-color: var(--backgroundColor);
            --indentation: .4em;
            clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--indentation)), calc(100% - var(--indentation)) 100%, 0 100%);
            padding: calc(var(--indentation) / 1.25);
        }

        .layeredImageContainer {
            position: relative;
        }
        .layeredImageContainer :nth-child(2) {
            position: absolute;
            left: 25px;
            top: 14px;
            width: 40%;
            z-index: 1;
        }
        
        #specials: {
            width: 100%;
        }

        .hidden {
            display: none;
        }
    </style>
    <div id="controls" class="spacedColumn">
        <div id="basicControls" class="spacedRow">
            <vpl-label prefix="Mech Name:" id="label">
                <div slot="content" id="searchContainer">
                    <input type="text" id="unitName"></input>
                    <img src="/assets/spinner.svg" id="spinner"></img>
                </div>
            </vpl-label>
            <button id="search">Search</button>
            <button id="roster">Roster</button>
            <vpl-label prefix="PV Total:" id="label">
                <div id="pvTotal" slot="content">0</div>
            </vpl-label>
            <button id="clear">Clear Roster</button>
        </div>
        <div id="advancedControls" class="spacedRow">
            <div id="expandableControls" class="spacedColumn hidden">
                <div class="spacedRow">
                    <vpl-label prefix="Min PV">
                        <input type="number" id="minPV" value="0" min="0" max="100" slot="content"/>
                    </vpl-label>
                    <vpl-label prefix="Max PV">
                        <input type="number" id="maxPV" value="100" min="0" max="100" slot="content"/>
                    </vpl-label>
                    <vpl-label prefix="Min Production Date">
                        <input type="number" id="minPD" value="2400" min="2000" max="3300" slot="content"/>
                    </vpl-label>
                    <vpl-label prefix="Max Production Date">
                        <input type="number" id="maxPD" value="3150" min="2000" max="3300" slot="content"/>
                    </vpl-label>
                </div>
                <vpl-label prefix="Sizes: ">
                    <div id="sizesContainer"  slot="content" class="spacedRow">
                        <vpl-label prefix="1 (Light)">
                            <input type="checkbox" id="sizeLight" checked="true" slot="content"/>
                        </vpl-label>
                        <vpl-label prefix="2 (Medium)">
                            <input type="checkbox" id="sizeMedium" checked="true" slot="content"/>
                        </vpl-label>
                        <vpl-label prefix="3 (Heavy)">
                            <input type="checkbox" id="sizeHeavy" checked="true" slot="content"/>
                        </vpl-label>
                        <vpl-label prefix="4 (Assault)">
                            <input type="checkbox" id="sizeAssault" checked="true" slot="content"/>
                        </vpl-label>
                    </div>
                </vpl-label>
                <vpl-label prefix="Tech Levels: ">
                    <div id="techLevelContainer"  slot="content" class="spacedRow">
                        <vpl-label prefix="Inner Sphere">
                            <input type="checkbox" id="techLevelInnerSphere" checked="true" slot="content"/>
                        </vpl-label>
                        <vpl-label prefix="Clan">
                            <input type="checkbox" id="techLevelClan" checked="true" slot="content"/>
                        </vpl-label>
                        <vpl-label prefix="Mixed">
                            <input type="checkbox" id="techLevelMixed" checked="true" slot="content"/>
                        </vpl-label>
                        <vpl-label prefix="Primitive">
                            <input type="checkbox" id="techLevelPrimitive" checked="true" slot="content"/>
                        </vpl-label>
                    </div>
                </vpl-label>
                <vpl-label prefix="Specials:">
                    <input type="text" id="specials" slot="content"></input>
                </vpl-label>
            </div>
            <div id="advancedButtonsContainer" class="spacedColumn">
                <button id="advancedToggle" class="layeredImageContainer">
                    <img src="/assets/magnifyingGlass.svg">
                    <img src="/assets/plus.svg">
                </button>
                <button id="clearAdvanced" class="hidden layeredImageContainer">
                    <img src="/assets/magnifyingGlass.svg">
                    <img src="/assets/not.svg">
                </button>
            </div>
        </div>
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

        this.requestId = 0;

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.controlsElem = this.shadowRoot.getElementById("controls");

        this.unitNameElem = this.shadowRoot.getElementById("unitName");
        this.mechContainerElem = this.shadowRoot.getElementById("mechContainer");
        this.spinnerElem = this.shadowRoot.getElementById("spinner");
        this.rosterElem = this.shadowRoot.getElementById("roster");
        this.rosterElem.addEventListener("pointerdown", event => {
            urlHelper.setParams({
                page: "roster",
            });
        });

        this.pvTotalElem = this.shadowRoot.getElementById("pvTotal");

        this.clearElem = this.shadowRoot.getElementById("clear");
        this.clearElem.addEventListener("pointerdown", event => {
            urlHelper.consumeParams(["units"]);
            this.pvTotalElem.innerText = 0;
        });


        this.searchElem = this.shadowRoot.getElementById("search");
        this.searchElem.addEventListener("pointerdown", event => {
            this.searchUnit(this.unitNameElem.value);
        });
        this.controlsElem.addEventListener("keypress", async event => {
            if (event.key ===  "Enter") {
                this.searchUnit(this.unitNameElem.value);
            }
        });

        this.expandableControlsElem = this.shadowRoot.getElementById("expandableControls");
        this.minPVElem = this.shadowRoot.getElementById("minPV");
        this.maxPVElem = this.shadowRoot.getElementById("maxPV");
        this.minPDElem = this.shadowRoot.getElementById("minPD");
        this.maxPDElem = this.shadowRoot.getElementById("maxPD");
        this.sizeLightElem = this.shadowRoot.getElementById("sizeLight");
        this.sizeMediumElem = this.shadowRoot.getElementById("sizeMedium");
        this.sizeHeavyElem = this.shadowRoot.getElementById("sizeHeavy");
        this.sizeAssaultElem = this.shadowRoot.getElementById("sizeAssault");
        this.techLevelInnerSphereElem = this.shadowRoot.getElementById("techLevelInnerSphere");
        this.techLevelClanElem = this.shadowRoot.getElementById("techLevelClan");
        this.techLevelMixedElem = this.shadowRoot.getElementById("techLevelMixed");
        this.techLevelPrimitiveElem = this.shadowRoot.getElementById("techLevelPrimitive");
        this.specialsElem = this.shadowRoot.getElementById("specials");

        this.advancedToggleElem = this.shadowRoot.getElementById("advancedToggle");
        this.advancedToggleElem.addEventListener("pointerdown", event => {
            this.expandableControlsElem.classList.toggle("hidden");
            this.clearAdvancedElem.classList.toggle("hidden");
        });

        this.clearAdvancedElem = this.shadowRoot.getElementById("clearAdvanced");
        this.clearAdvancedElem.addEventListener("pointerdown", event => {
            for (const elem of [this.minPVElem, this.maxPVElem, this.minPDElem, this.maxPDElem]) {
                elem.value = elem.defaultValue;
            }
            for (const elem of [
                    this.sizeLightElem,
                    this.sizeMediumElem,
                    this.sizeHeavyElem,
                    this.sizeAssaultElem,
                    this.techLevelInnerSphereElem,
                    this.techLevelClanElem,
                    this.techLevelMixedElem,
                    this.techLevelPrimitiveElem,
                ]) {
                elem.checked = true;
            }
            this.specialsElem.value = "";
        });
    }

    connectedCallback() {
        const params = urlHelper.getParams();
        if (params.advancedParams && params.advancedParams.length) {
            this.expandableControlsElem.classList.toggle("hidden", false);
        }
        if (params.unitName) {
            this.searchUnit(this.unitNameElem.value = urlHelper.consumeParams(["unitName"]).unitName);
        }

        const units = params.units ? params.units.map(i => unitHelper.decode(i)) : [];
        if (units.length) {
            this.sumPointValue(units);
        }
    }

    async searchUnit(unitName) {
        this.spinnerElem.classList.add("show");
        while (this.mechContainerElem.hasChildNodes()) {
            this.mechContainerElem.removeChild(this.mechContainerElem.lastChild);
        }
        try {
            this.requestId++;
            const params = {
                unitName,
            };

            for (const key of advancedParams) {
                switch (key) {
                    case "techLevels":
                        params[key] = techLevelParams.reduce((values, key) => {
                            if (this[`techLevel${key.name}Elem`].checked) {
                                values.push(key.id);
                            }
                            return values;
                        }, []).join(",");
                    break;
                    case "sizes":
                        params[key] = sizeParams.reduce((values, key) => {
                            if (this[`size${key.name}Elem`].checked) {
                                values.push(key.id);
                            }
                            return values;
                        }, []).join(",");
                    break;
                    case "specials":
                        params[key] = this.specialsElem.value.split(",").map(i => i.trim()).join(",");
                    break;
                    default: params[key] = this[`${key}Elem`].value; break;
                }
            }
            urlHelper.setParams(params);
            const unParsed = await window.fetch(`/sw-units?${Object.keys(params).map(key => `${key.toLowerCase()}=${params[key]}`).join("&")}`);
            this.spinnerElem.classList.remove("show");
            this.buildCards(JSON.parse(await unParsed.text()), this.requestId);
        }
        catch (err) {
            globals.handleError(`Error getting unit: ${err}`);
        }
    }

    // TODO: need a better solution than this.
    // Scale the div that contains these cards so that it is the card height * number of cards
    // set up recycling and only have enough card elements created at any time to fill the screen
    // Recycle existing cards when the user scrolls so performance is better with very large
    // number of cards
    buildCards(units, requestId) {
        if (units.length && requestId === this.requestId) {
            const unit = units.splice(0, 1)[0];
            this.buildCard(unit);
            window.requestIdleCallback(timingData => {
                this.buildCards(units, requestId);
            }, {timeout: 50});
        }
    }

    buildCard(unit) {
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

    addUnit(unit) {
        const params = urlHelper.getParams();
        const units = params.units ? params.units.map(i => unitHelper.decode(i)) : [];
        const modal = document.createElement("vpl-customize-unit");
        modal.pv = unit.pv;
        globals.addModal(modal);
        modal.addEventListener("submit", event => {
            units.push(Object.assign({}, unit, event.detail));
            urlHelper.setParams({units: units.map(i => unitHelper.encode(i))});
            globals.removeModal(modal);
            this.sumPointValue(units);
        });
    }

    removeUnit(id) {
        const params = urlHelper.getParams();
        const units = params.units ? params.units.map(i => unitHelper.decode(i)) : [];
        const firstIndex = units.findIndex(i => i.id === id);
        if (firstIndex !== -1) {
            units.splice(firstIndex, 1);
        }
        urlHelper.setParams({units: units.map(i => unitHelper.encode(i))});
        this.sumPointValue(units);
    }

    async sumPointValue(units) {
        let pvTotal = 0;
        if (units.length) {
            try {
                const unParsed = await window.fetch(`/sw-units?unitIds=${units.map(i => i.id).join(",")}`);
                const unitDefs = JSON.parse(await unParsed.text());
                units.forEach((unit, index) => {
                    const def = unitDefs.find(def => def.id === unit.id);
                    if (def) {
                        pvTotal += unitHelper.calculatePointValue(def.pv, unit.skill);
                    }
                });
            }
            catch (err) {
                globals.handleError(`Error getting unit: ${err}`);
            }
        }
        this.pvTotalElem.innerText = pvTotal;
    }
}

customElements.define("search-page", searchPage);
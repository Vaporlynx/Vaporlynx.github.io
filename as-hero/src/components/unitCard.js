import * as unitHelper from "../../src/unitHelper.js";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            height: 100%;
            background-color: var(--nonInteractiveElementBackgroundColor);
            color: var(--nonInteractiveElementBackgroundFontColor);
            padding: 10px;
            --bevelBgColor: var(--nonInteractiveElement2BackgroundColor);
            border: .1em solid;
            border-color: var(--nonInteractiveElementBackgroundColor);
            box-sizing: border-box;
            --fullPad: 0.2em;
        }

        .hidden {
            display: none;
        }
        
        #cardBody {
            height: 100%;
            width: 100%;
        }
        #cardBody > div:not(:last-child) {
            margin-bottom: var(--fullPad);
        }

        vpl-label {
            align-items: center;
        }
    
        .spacedRow {
            display: flex;
            flex-direction: row;
        }
    
        .spacedColumn {
            display: flex;
            flex-direction: column;
        }

        .bevel {
            background-color: var(--nonInteractiveElement2BackgroundColor);
            clip-path: polygon(0 0, calc(100% - var(--bevelOffset)) 0, 100% var(--bevelOffset), 100% 100%, var(--bevelOffset) 100%, 0 calc(100% - var(--bevelOffset)));
            padding: calc(var(--bevelOffset) / 2);
        }

        #header {
            justify-content: space-between;
            height: 10%;
            font-weight: bold;
            font-size: 125%;
            align-items: center;
        }
        #header > * {
            height: 100%;
            box-sizing: border-box;
        }
        #header > *:not(:last-child) {
            margin-right: var(--fullPad);
        }
        #upperDetails {
            height: 40%;
            font-size: 130%;
        }

        #mainDetails {
            width: 70%;
        }
        #mainDetails > div {
            height: 30%;
            align-items: center;
        }
        #mainDetails > div:not(:last-child) {
            margin-bottom: var(--fullPad);
        }

        #lowerDetails {
            height: 50%;
            font-size: 140%;
        }

        #image {
            width: 30%;
            object-fit: contain;
            margin-left: var(--fullPad);
        }

        #attributes {
            justify-content: space-around;
        }

        #damage {
            justify-content: space-around;
        }

        #noteContainer {
            width: 60%;
        }

        #pvContainer {
        }

        #structureSpecials {
            width: 60%;
        }
        
        #health {
            height: 40%;
            justify-content: space-between;
        }
        #health vpl-label vpl-pips {
            flex-wrap: wrap;
        }

        #special {
            height: 60%;
            word-wrap: break-word;
            margin-top: var(--fullPad);
        }

        #criticalsContainer {
            width: 40%;
            display: flex;
            flex-direction: column;
            margin-left: var(--fullPad);
            align-items: center;
        }

        #criticals {
            width: 100%;
            height: 100%;
            display: flex;
        }
    </style>
    <div id="cardBody" class="spacedColumn">
        <div id="header" class="spacedRow">
            <div id="name" class="spacedColumn bevel">
            </div>
            <vpl-label prefix="" id="noteContainer" class="bevel hidden">
                <div id="note" slot="content"></div>
            </vpl-label>
            <vpl-label prefix="PV:" id="pvContainer" class="bevel">
                <div id="pv" slot="content"></div>
            </vpl-label>
        </div>
        <div id="upperDetails" class="spacedRow">
            <div class="spacedColumn" id="mainDetails">
                <div id="attributes" class="spacedRow bevel">
                    <vpl-label prefix="TP:">
                        <div id="type" slot="content">
                        </div>
                    </vpl-label>
                    <vpl-label prefix="SZ:">
                        <div id="size" slot="content">
                        </div>
                    </vpl-label>
                    <vpl-label prefix="TMM:">
                        <div id="tmm" slot="content">
                        </div>
                    </vpl-label>
                    <vpl-label prefix="MV:">
                        <div id="movement" slot="content">
                        </div>
                    </vpl-label>
                    <vpl-label prefix="Role:">
                        <div id="role" slot="content">
                        </div>
                    </vpl-label>
                    <vpl-label prefix="Skill:">
                        <div id="skill" slot="content">
                        </div>
                    </vpl-label>
                </div>
                <div id="damage" class="spacedRow bevel">
                    <vpl-label prefix="S(+0)">
                        <div id="short" slot="content"></div>
                    </vpl-label>
                    <vpl-label prefix="M(+2)">
                        <div id="medium" slot="content"></div>
                    </vpl-label>
                    <vpl-label prefix="L(+4)">
                        <div id="long" slot="content"></div>
                    </vpl-label>
                </div>
                <div id="heat" class="spacedRow bevel">
                    <vpl-label prefix="OV:">
                        <div id="overheat" slot="content"></div>
                    </vpl-label>
                    <vpl-label prefix="Heat Scale">
                        <vpl-pips id="heatScale" slot="content" total-pips="4" marked="0"></vpl-pips>
                    </vpl-label>
                </div>
            </div>
            <img id="image"></img>
        </div>
        <div id="lowerDetails" class="spacedRow">
            <div id="structureSpecials" class="spacedColumn">
                <div id="health" class="spacedColumn bevel">
                    <vpl-label prefix="A">
                        <vpl-pips id="armor" slot="content" mode="subtractive"></vpl-pips>
                    </vpl-label>
                    <vpl-label prefix="S">
                        <vpl-pips id="structure" slot="content" mode="subtractive"></vpl-pips>
                    </vpl-label>    
                </div>
                <div id="special" class="bevel"></div>
            </div>
            <vpl-label prefix="CRITICAL HITS"  id="criticalsContainer" class=" bevel">
                <div id="criticals" slot="content"></div>
            </vpl-label>
        </div>
    </div>
`;

export default class UnitCard extends HTMLElement {
    static get template() {
      return template;
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.nameElem = this.shadowRoot.getElementById("name");
        this.noteContainerElem = this.shadowRoot.getElementById("noteContainer");
        this.noteElem = this.shadowRoot.getElementById("note");
        this.pvElem = this.shadowRoot.getElementById("pv");
        this.typeElem = this.shadowRoot.getElementById("type");
        this.sizeElem = this.shadowRoot.getElementById("size");
        this.movementModifierElem = this.shadowRoot.getElementById("tmm");
        this.movementElem = this.shadowRoot.getElementById("movement");
        this.roleElem = this.shadowRoot.getElementById("role");
        this.skillElem = this.shadowRoot.getElementById("skill");
        this.shortElem = this.shadowRoot.getElementById("short");
        this.mediumElem = this.shadowRoot.getElementById("medium");
        this.longElem = this.shadowRoot.getElementById("long");

        this.armorElem = this.shadowRoot.getElementById("armor");
        this.structureElem = this.shadowRoot.getElementById("structure");

        this.overheatElem = this.shadowRoot.getElementById("overheat");

        this.specialElem = this.shadowRoot.getElementById("special");

        this.criticalsElem = this.shadowRoot.getElementById("criticals");

        this.imageElem = this.shadowRoot.getElementById("image");

        this.armorElem.addEventListener("change", event => this.handleUnitAttributesChanged(event));
        this.structureElem.addEventListener("change", event => this.handleUnitAttributesChanged(event));
        this.overheatElem.addEventListener("change", event => this.handleUnitAttributesChanged(event));
        this.criticalsElem.addEventListener("change", event => this.handleUnitAttributesChanged(event));

        this._data = null;
    }

    set data(val) {
        // TODO: fix bug where setting this immediately breaks the pips
        setTimeout(() => {
            if (val !== this._data) {
                this._data = val;
                this.nameElem.textContent = val.name;
                if (val.note) {
                    this.noteElem.textContent = val.note;
                    this.noteContainerElem.classList.remove("hidden");
                }
                if (val.squad) {
                    this.style.borderColor = `#${val.squad}`;
                }
                this.typeElem.textContent = val.type;
                this.sizeElem.textContent = val.size;
                this.movementElem.textContent = val.movement;
                this.roleElem.textContent = val.role;
                this.skillElem.textContent = val.skill;
                this.shortElem.textContent = val.damage.short;
                this.mediumElem.textContent = val.damage.medium;
                this.longElem.textContent = val.damage.long;
                this.armorElem.totalPips = val.totalArmor;
                this.armorElem.marked = val.armor;
                this.structureElem.totalPips = val.totalStructure;
                this.structureElem.marked = val.structure;
                this.overheatElem.textContent = val.totalOverheat || 0;
                this.overheatElem.marked = val.overheat;
                this.specialElem.textContent = `Special: ${val.special ? val.special.split(",").join(", ") : ""}`;
                this.imageElem.src = val.image;
                let critElem = null;
                switch (val.type) {
                    case "BM": critElem = document.createElement("vpl-mech-crit-chart"); break;
                    case "CV": critElem = document.createElement("vpl-vehicle-crit-chart"); break;
                    case "AF": critElem = document.createElement("vpl-aerospace-crit-chart"); break;
                }
                if (critElem) {
                    this.criticalsElem.appendChild(critElem);
                }
                this.pvElem.textContent = unitHelper.calculatePointValue(val.pv, val.skill);
                this.movementModifierElem.textContent = unitHelper.calculateTMM(parseInt(val.movement));
            }
        }, 1);
    }

    get data () {
        return this._data;
    }

    handleUnitAttributesChanged (event) {
        this.data[event.target.id] = event.detail.value;
        this.dispatchEvent(new CustomEvent("dataUpdated", {detail: {data: this.data}}));
    }
}

customElements.define("unit-card", UnitCard);
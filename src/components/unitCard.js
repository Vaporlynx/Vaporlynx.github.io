const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            width: 700px;
            height: 500px;
            display: flex;
            background-color: #282c38;
            --bevelBgColor: #585c86;
            color: #fff557;
            padding: 10px;
        }
        #cardBody {
            height: 100%;
            width: 100%;
        }
    
        .spacedRow {
            display: flex;
            flex-direction: row;
        }
    
        .spacedColumn {
            display: flex;
            flex-direction: column;
        }

        // Bevel garbage
        .bevel.all {
            background: var(--bevelBgColor);
            background:
                -moz-linear-gradient(45deg,  transparent 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(135deg, transparent 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(315deg, transparent 10px, var(--bevelBgColor) 10px);
            background:
                -o-linear-gradient(45deg,  transparent 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(135deg, transparent 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(315deg, transparent 10px, var(--bevelBgColor) 10px);
            background:
                -webkit-linear-gradient(45deg,  transparent 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(135deg, transparent 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(315deg, transparent 10px, var(--bevelBgColor) 10px);
        }
        .bevel.tlbr {
            background: var(--bevelBgColor);
            background:
                -moz-linear-gradient(45deg,  var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(135deg, transparent 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(225deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(315deg, transparent 10px, var(--bevelBgColor) 10px);
            background:
                -o-linear-gradient(45deg,  var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(135deg, transparent 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(225deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(315deg, transparent 10px, var(--bevelBgColor) 10px);
            background:
                -webkit-linear-gradient(45deg,  var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(135deg, transparent 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(225deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(315deg, transparent 10px, var(--bevelBgColor) 10px);
        }
        .bevel.trbl {
            background: var(--bevelBgColor);
            background:
                -moz-linear-gradient(45deg,  transparent 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(135deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(315deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px);
            background:
                -o-linear-gradient(45deg,  transparent 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(135deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(315deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px);
            background:
                -webkit-linear-gradient(45deg,  transparent 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(135deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(315deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px);
        }
        .bevel.tr {
            background: var(--bevelBgColor);
            background:
                -moz-linear-gradient(45deg,  var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(135deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -moz-linear-gradient(315deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px);
            background:
                -o-linear-gradient(45deg,  var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(135deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -o-linear-gradient(315deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px);
            background:
                -webkit-linear-gradient(45deg,  var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(135deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(225deg, transparent 10px, var(--bevelBgColor) 10px),
                -webkit-linear-gradient(315deg, var(--bevelBgColor) 10px, var(--bevelBgColor) 10px);
        }
        .bevel.all, .bevel.trbl, .bevel.tlbr, .bevel.tr {
            background-position: bottom left, bottom right, top right, top left;
            -moz-background-size: 50% 50%;
            -webkit-background-size: 50% 50%;
            background-size: 50% 50%;
            background-repeat: no-repeat;
            margin-bottom: 15px;
            padding: 15px;
        }

        #header {
            justify-content: space-between;
        }

        #upperDetails {
            height: 200px;
        }

        #mainDetails {
            width: 100%;
        }

        #lowerDetails {
            height: 225px;
        }

        #image {
            width: 250px;
            object-fit: contain;
            height: inherit;
            margin-left: 10px;
        }

        #attributes {
            justify-content: space-around;
        }

        #damage {
            justify-content: space-around;
        }

        #name {
            width: 200px;
        }

        #pvContainer {
            width: 100px;
        }

        #structureSpecials {
            width: 100%;
        }
        
        #health {
            height: 58px;
            justify-content: space-between;
        }

        #specialContainer {
            height: 76px;
        }

        #criticals {
            width: 300px;
            margin-left: 10px;
        }
    </style>
    <div id="cardBody" class="spacedColumn">
        <div id="header" class="spacedRow">
            <div id="name" class="spacedColumn bevel trbl">
            </div>
            <vpl-label prefix="PV:" id="pvContainer" class="bevel trbl">
            <div id="pv" slot="content">
            </div>
        </div>
        <div id="upperDetails" class="spacedRow">
            <div class="spacedColumn" id="mainDetails">
                <div id="attributes" class="spacedRow bevel trbl">
                    <vpl-label prefix="TP:">
                        <div id="type" slot="content">
                        </div>
                    </vpl-label>
                    <vpl-label prefix="SZ:">
                        <div id="size" slot="content">
                        </div>
                    </vpl-label>
                    <div id="tmm">
                    </div>
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
                <div id="damage" class="spacedRow bevel trbl">
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
                <div id="heat" class="spacedRow bevel trbl">
                    <div id="overheat>
                    </div>
                    <div id="heatScale">
                    </div>
                </div>
            </div>
            <img id="image"></img>
        </div>
        <div id="lowerDetails" class="spacedRow">
            <div id="structureSpecials" class="spacedColumn">
                <div id="health" class="spacedColumn bevel trbl">
                    <vpl-label prefix="A">
                        <vpl-pips id="armor" slot="content"></vpl-pips>
                    </vpl-label>
                    <vpl-label prefix="S">
                        <vpl-pips id="structure" slot="content"></vpl-pips>
                    </vpl-label>    
                </div>
                <vpl-label prefix="Special:"  id="specialContainer" class="bevel trbl">
                    <div id="special" slot="content"></div>
                </vpl-label>
            </div>
            <div id="criticals" class="spacedColumn bevel trbl">
                <div>
                    Critical Hits
                </div>
            </div>
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
        this.pvElem = this.shadowRoot.getElementById("pv");
        this.typeElem = this.shadowRoot.getElementById("type");
        this.sizeElem = this.shadowRoot.getElementById("size");
        this.movementElem = this.shadowRoot.getElementById("movement");
        this.roleElem = this.shadowRoot.getElementById("role");
        this.skillElem = this.shadowRoot.getElementById("skill");
        this.shortElem = this.shadowRoot.getElementById("short");
        this.mediumElem = this.shadowRoot.getElementById("medium");
        this.longElem = this.shadowRoot.getElementById("long");

        this.armorElem = this.shadowRoot.getElementById("armor");
        this.structureElem = this.shadowRoot.getElementById("structure");

        this.specialElem = this.shadowRoot.getElementById("special");

        this.imageElem = this.shadowRoot.getElementById("image");

        this._data = null;
    }

    set data(val) {
        // WTF? setting data before constructors have had a chance to run?
        setTimeout(() => {
            if (val !== this._data) {
                this._data = val;
                this.nameElem.textContent = val.name;
                this.pvElem.textContent = val.pv;
                this.typeElem.textContent = val.type;
                this.sizeElem.textContent = val.size;
                this.movementElem.textContent = val.movement;
                this.roleElem.textContent = val.role;
                this.skillElem.textContent = val.skill;
                this.shortElem.textContent = val.damage.short;
                this.mediumElem.textContent = val.damage.medium;
                this.longElem.textContent = val.damage.long;
                this.armorElem.totalPips = val.armor;
                this.structureElem.totalPips = val.structure;
                this.specialElem.textContent = val.special;
                this.imageElem.src = val.image;
            }
        }, 1);
    }

    get data () {
        return this._data;
    }
}

customElements.define("unit-card", UnitCard);
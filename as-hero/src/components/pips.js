const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            clip-path: polygon(0 0, calc(100% - var(--bevelOffset)) 0, 100% var(--bevelOffset), 100% 100%, var(--bevelOffset) 100%, 0 calc(100% - var(--bevelOffset)));
            padding: calc(var(--bevelOffset) / 2);
            --activePipColor: var(--interactiveElementBackgroundColorActive);
            --inactivePipColor: var(--interactiveElementBackgroundColor);
            --hoverPipColor: var(--interactiveElementHoverBackgroundColor);
            --pipIndent: .2em;
            --pipHeight: 1em;
            --pipWidth: 1em;
            --bevelOffset: .5em;
        }

        .disabled {
            pointer-events: none;
        }

        #pipsContainer {
            display: flex;
        }

        .pip {
            height: var(--pipHeight);
            width: var(--pipWidth);
            background-color: var(--inactivePipColor);
            clip-path: polygon(var(--pipIndent) 0, calc(100% - var(--pipIndent)) 0, 100% var(--pipIndent), calc(100% - var(--pipIndent)) 100%, var(--pipIndent) 100%, 0 calc(100% - var(--pipIndent)));
            padding: calc(var(--pipIndent) / 2);
        }
        .pip:hover {
            background-color: var(--hoverPipColor);
        }

        .checked {
            background-color: var(--activePipColor);
        }

        img {
            height: 0.8em;
            user-select: none;
        }
    </style>
    <img src="./assets/minus.svg" id="minusGuide"></img>
    <div id="pipsContainer"></div>
    <img src="./assets/plus.svg" id="plusGuide"></img>
`;

export default class pips extends HTMLElement {
    static get template() {
      return template;
    }

    static get observedAttributes() {
        return ["total-pips", "mode", "marked"];
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.pipsContainerElem = this.shadowRoot.getElementById("pipsContainer");

        this.minusGuideElem = this.shadowRoot.getElementById("minusGuide");
        this.plusGuideElem = this.shadowRoot.getElementById("plusGuide");

        this._totalPips = 0;
        this._mode = "individual";
        this._marked = 0;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "total-pips": this.totalPips = newValue; break;
            case "mode": this.mode = newValue; break;
            case "marked": this.marked = parseInt(newValue); break;
        }
    }

    set totalPips (val) {
        if (val !== this._totalPips) {
            while (this.pipsContainerElem.hasChildNodes()) {
                this.pipsContainerElem.removeChild(this.pipsContainerElem.lastChild);
            }

            this._totalPips = val;
            for (let i = 0; i < val; i++) {
                const pip = document.createElement("div");
                pip.classList.add("pip");
                if (this.mode === "individual") {
                    this.minusGuideElem.style.display = "none";
                    this.plusGuideElem.style.display = "none";
                    pip.addEventListener("click", event => {
                        const index = [...this.pipsContainerElem.children].indexOf(event.target) + 1;
                        const offset = this.marked === index ? -1 : 0;
                        this.marked = index + offset;
                        this.dispatchEvent(new CustomEvent("change", {detail: {value: this.marked}}));
                    });
                }
                else {
                    this.minusGuideElem.style.display = "inherit";
                    this.plusGuideElem.style.display = "inherit";
                    pip.classList.add("disabled");
                }
                pip.checked = true;
                this.pipsContainerElem.appendChild(pip);
            }
            if (["additive", "subtractive"].includes(this.mode)) {
                this.addEventListener("click", event => {
                    this.marked = event.offsetX > this.clientWidth / 2 ? this.marked + 1 : this.marked - 1;
                    this.dispatchEvent(new CustomEvent("change", {detail: {value: this.marked}}));
                });
            }
            if (this.mode === "subtractive") {
                this.marked = this.totalPips;
            }
        }
    }

    get totalPips () {
        return this._totalPips;
    }

    set marked (val) {
        val = Math.max(0, Math.min(val, this.totalPips));
        for (let i = 0; i < this.totalPips; i++) {
            this.pipsContainerElem.children[i].classList.toggle("checked", false);
        }
        for (let i = 0; i < val; i++) {
            this.pipsContainerElem.children[i].classList.toggle("checked", true);
        }
        this._marked = val;
    }

    get marked () {
        return this._marked;
    }

    set mode (val) {
        if (this._mode !== val) {
            this._mode = val;
            // Trigger rebuild if needed
            if (this.totalPips !== 0) {
                this.totalPips = this.totalPips;
            }
            if (val === "individual") {
                this.style.backgroundColor = "inherit";
            }
            else {
                this.style.backgroundColor = "var(--nonInteractiveElement3BackgroundColor)";
            }
        }
    }

    get mode () {
        return this._mode;
    }

}

customElements.define("vpl-pips", pips);
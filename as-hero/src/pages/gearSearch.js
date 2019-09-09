import {default as searchPage} from "./search.js";

export default class gearSearchPage extends searchPage {
    constructor() {
        super();

        this.unitCard = "gear-unit-card";
        this.searchCounterpart = "search";
        this.rosterPage = "gear-roster";
    }
}

customElements.define("gear-search-page", gearSearchPage);
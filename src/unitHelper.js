const encodeKeys = ["id", "skill", "armor", "structure", "note"];
const delimiter = "|";

export const encode = unit => {
    return encodeKeys.reduce((unitString, key, index) => {
        let value = encodeURI(unit[key]);
        if (key === "note") {
            value = value.substring(0, 128);
        }
        if (index) {
            return `${unitString}${delimiter}${value}`;
        }
        else {
            return `${value}`;
        }
    }, "");
};

export const decode = unitString => {
    return unitString.split(delimiter).reduce((unit, val, index) => {
        const key = encodeKeys[index];
        switch (key) {
            case "note": unit[key] = decodeURI(val); break;
            default: unit[key] = parseInt(val); break;
        }
        return unit;
    }, {});
};

export const calculatePointValue = (val, skill) => {
    // TODO: look and see if these numbers are driven by a formula, use that if they are.
    let skillMod = 1;
    switch (skill) {
        case 0: skillMod = 2.63; break;
        case 1: skillMod = 2.24; break;
        case 2: skillMod = 1.82; break;
        case 3: skillMod = 1.38; break;
        case 4: skillMod = 1.0; break;
        case 5: skillMod = 0.86; break;
        case 6: skillMod = 0.77; break;
        case 7: skillMod = 0.68; break;
    }
    return Math.round(val * skillMod);
};
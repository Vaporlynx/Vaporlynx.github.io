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
// as per errata 6/6/2018 https://bg.battletech.com/forums/index.php?topic=31693.0
export const calculatePointValue = (val, skill) => {
    if (skill === 4) {
        return val;
    }
    else if (skill > 4) {
        return val - (Math.ceil((val - 14) / 10) + 1) * (skill - 4);
    }
    else {
        return val + (Math.ceil((val - 7) / 5) + 1) * (4 - skill);
    }
};
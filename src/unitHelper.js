const encodeKeys = ["id", "skill", "armor", "structure", "squad", "note"];
const delimiter = ",";

export const encode = unit => {
    return encodeKeys.reduce((unitString, key, index) => {
        let value = unit[key];
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
            case "squad":
            case "note": unit[key] = val; break;
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

export const calculateTMM = val => {
    let targetMovementModifier = 0;
        if (val < 5) {
          targetMovementModifier = 0;
        }
        else if (val < 9) {
            targetMovementModifier = 1;
        }
        else if (val < 13) {
            targetMovementModifier = 2;
        }
        else if (val < 19) {
            targetMovementModifier = 3;
        }
        else if (val < 35) {
            targetMovementModifier = 4;
        }
        else if (val >= 35) {
            targetMovementModifier = 5;
        }
    return targetMovementModifier;
}
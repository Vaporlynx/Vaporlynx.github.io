const encodeKeys = ["id", "skill", "armor", "structure"];
const delimiter = "|";

export const encode = unit => {
    return encodeKeys.reduce((unitString, key, index) => {
        if (index) {
            return `${unitString}${delimiter}${unit[key]}`;
        }
        else {
            return `${unit[key]}`;
        }
    }, "");
};

export const decode = unitString => {
    return unitString.split(delimiter).reduce((unit, val, index) => {
        unit[encodeKeys[index]] = parseInt(val);
        return unit;
    }, {});
};
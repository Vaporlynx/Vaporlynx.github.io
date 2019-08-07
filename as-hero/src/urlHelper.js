// TODO: pay very close attention to the '*', using this to denote the end of an array may be unsafe
// Maybe just encodeURI(JSON.stringify(params)) would be safer and easier

const params = {};

const pull = () => {
    if (window.location.hash) {
        const hash = decodeURI(window.location.hash.substr(1));
        for (const param of hash.split("&")) {
            const split = param.split("=");
            const key = split[0];
            let value = split[1];
            if (value.includes("*")) {
                value = value.replace("*", "").split(":");
            }
            params[key] = value;
        }
    }
    return params;
};
pull();

const push = (newParams = params) => {
    if (!newParams.page) {
        newParams.page = "search";
    }
    const newHash = encodeURI(Object.keys(newParams).reduce((hash, key) => {
        const encodedValue = Array.isArray(newParams[key]) ? `${newParams[key].join(":")}*` : newParams[key].toString();
        return `${hash}${hash === "#" ? "" : "&"}${key}=${encodedValue}`;
    }, "#"));
    history.pushState(params, "", newHash);
};

window.addEventListener("hashchange", () => {
    pull();
    window.dispatchEvent(new CustomEvent("urlUpdated"));
});

export const getParams = () => {
    return params;
};

export const setParams = (newParams, replace) => {
    if (replace) {
        push(newParams);
    }
    else {
        Object.assign(params, newParams);
        push();
    }
    window.dispatchEvent(new CustomEvent("urlUpdated"));
};

export const consumeParams = keys => {
    const deletedKeys = keys.reduce((deletedKeys, key) => {
        deletedKeys[key] = params[key];
        delete params[key];
        return deletedKeys;
    }, {});
    push(params);
    window.dispatchEvent(new CustomEvent("urlUpdated"));
    return deletedKeys;
};


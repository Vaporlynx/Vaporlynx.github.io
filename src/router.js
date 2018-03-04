const params = {};

const pull = () => {
    if (window.location.hash) {
        const hash = window.location.hash.substr(1);
        for (const param of hash.split("&")) {
            const split = param.split("=");
            params[split[0]] = split[1];
        }
    }
    return params;
};
pull();

const push = (newParams = params) => {
    if (!newParams.page) {
        newParams.page = "search";
    }
    const newHash = Object.keys(newParams).reduce((hash, key) => `${hash}${hash === "#" ? "" : "&"}${key}=${newParams[key]}`, "#");
    history.pushState(null, null, newHash);
};

window.addEventListener("hashchange", () => {
    pull();
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
};

export const consumeParams = keys => {
    return keys.reduce((deletedKeys, key) => {
        deletedKeys[key] = params[key];
        delete params[key];
        return deletedKeys;
    }, {});
};
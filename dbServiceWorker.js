let unitDB = null;
let imageDB = null;
// TODO there doesn't seem to be any DS DA or MS in the MUL?
const unitTypes = ["BM", "IM", "PM", "CV", "SV", "AF", "CF", "DS", "DA", "SC", "MS", "CI", "BA"];
const validSearchParams = [
  "name",
  "type",
  "minPV",
  "maxPV",
];

const handleError = err => {
  console.log(err);
};

const unitDBConnection = indexedDB.open("unitDB", 1);
unitDBConnection.onerror = event => {
  handleError("error opening unitDB");
};

unitDBConnection.onupgradeneeded = event => {
  for (const unitType of unitTypes) {
    event.target.result.createObjectStore(unitType, {keyPath: "name"});
  }
};

const imageDBConnection = indexedDB.open("imageDB", 1);
imageDBConnection.onerror = event => {
  handleError("error opening imageDB");
};

imageDBConnection.onupgradeneeded = event => {
  event.target.result.createObjectStore("images", {keyPath: "url"});
};

const getImage = url => {
  return new Promise((resolve, reject) => {
    if (imageDB) {
      try {
        const request = imageDB.transaction("images").objectStore("images").get(url);
        request.onsuccess = event => {
          resolve(request.result);
        };
      }
      catch (err) {
        reject(`Failed to fetch image for url: ${url}`);
      }
    }
    else {
      reject("Image database not initialized!");
    }
  });
};

const setImage = (url,  data) => {
  return new Promise((resolve, reject) => {
    if (imageDB) {
      try {
        const request = imageDB.transaction("image", "readwrite").objectStore("image").put({url, data});
        request.onsuccess = event => {
          resolve();
        };
      }
      catch (err) {
        reject(`setImage failed for url: ${url}`);
      }
    }
    else {
      reject("Image database not initialized!");
    }
  });
};

const getUnits = type => {
  return new Promise((resolve, reject) => {
    if (unitDB) {
      const request = unitDB.transaction(type).objectStore(type).getAll();
      request.onerror = event => {
        reject(`Failed to get read transaction for type: ${type}`);
      };
      request.onsuccess = event => {
        resolve(request.result);
      };
    }
    else {
      reject("Unit database not initialized!");
    }
  });
};

const setUnit = (type,  data) => {
  return new Promise((resolve, reject) => {
    if (unitDB) {
      try {
        const request = unitDB.transaction(type, "readwrite").objectStore(type).put(data);
        request.onsuccess = event => {
          resolve();
        };
      }
      catch (err) {
        reject(`setUnit failed for: ${type}, name: ${data.name}`);
      }
    }
    else {
      reject("Unit database not initialized!");
    }
  });
};

const serveOrFetch = request => {
  const url = new URL(request.url);
  fetch(url).then(response => response.blob()).then(blob => URL.createObjectURL(blob)).then(data => {
    handleError("data?");
  });
  return new Promise(async (resolve, reject) => {
    const cachedData = await caches.match(request);
    if (cachedData) {
      resolve(cachedData);
    }
    else {
      const response = await fetch(request);
      const cache = await caches.open("urlCache");
      cache.put(request, response.clone());
      resolve(response);
    }
  });
};

const searchUnits = url => {
  const searchParams = {ids: []};
  for (const key of validSearchParams) {
    const value = url.searchParams.get(key);
    if (key === "id") {
      searchParams.ids.push(value);
    }
    else {
      if (value) {
        searchParams[key] = value;
      }
    }
  }
  return new Promise(async (resolve, reject) => {
    let results = [];
    for (const type of searchParams.types || unitTypes) {
      const units = await getUnits(type);
      for (const unit of units) {
        let valid = true;
        if (valid && searchParams.ids.length && !searchParams.ids.includes(unit.id)) {
          valid = false;
        }
        if (valid && searchParams.name && !unit.name.toLowerCase().includes(searchParams.name.toLowerCase())) {
          valid = false;
        }
        if (valid && searchParams.minPV && unit.pv <= searchParams.minPV) {
          valid = false;
        }
        if (valid && searchParams.maxPV && unit.pv >= searchParams.maxPV) {
          valid = false;
        }
        if (valid) {
          results.push(unit);
        }
      }
    }
    if (searchParams.ids.length) {
      const resultsCopy = results;
      results = [];
      for (const id of searchParams.ids) {
        results.push(resultsCopy.find(i => i.id = id));
      }
    }
    const response = new Response(JSON.stringify(results));
    resolve(response);
    // Don't sync with MUL it is not HTTPS
    // const queryString = Object.keys(searchParams).reduce((queryString, key) => {
    //   if (key === "ids") {
    //     return queryString;
    //   }
    //   else {
    //     return `${queryString}${key}=${searchParams[key]}`;
    //   }
    // }, "?");
    // fetch(`http://masterunitlist.info/Unit/QuickList${queryString}`)
    //   .then(request => request.text()).then(unParsed => JSON.parse(unParsed).Units).then(data => {
    //   for (const datum of data) {
    //     const unit = {
    //       id: datum.Id,
    //       name: datum.Name,
    //       pv: datum.BFPointValue,
    //       armor: datum.BFArmor,
    //       structure: datum.BFStructure,
    //       damage: {
    //         short: datum.BFDamageShort,
    //         medium: datum.BFDamageMedium,
    //         long: datum.BFDamageLong,
    //       },
    //       movement: datum.BFMove,
    //       image: datum.ImageUrl,
    //       type: datum.BFType,
    //       size: datum.BFSize,
    //       role: datum.Role.Name,
    //       skill: datum.Skill || 4,
    //       special: datum.BFAbilities,
    //       class: datum.Class,
    //       variant: datum.Variant,
    //     };
    //     setUnit(unit.type || "null", unit);
    //   }
    // }).catch(console.log);
  });
};

unitDBConnection.onsuccess = event => {
  unitDB = event.target.result;
  for (const type of unitTypes) {
      handleError(`Fetching bundled def for type ${type}`);
    fetch(`/defs/${type}-def.json`).then(request => request.text()).then(unParsed => JSON.parse(unParsed)).then(data => {
      handleError(`Got bundled def for type ${type}`);
      for (const key of Object.keys(data)) {
        const datum = data[key];
        const unit = {
          name: datum.nm,
          pv: datum.pv,
          armor: datum.ar,
          structure: datum.st,
          damage: {
            short: datum.da.s,
            medium: datum.da.m,
            long: datum.da.l,
          },
          movement: datum.mv,
          image: datum.img,
          type: datum.tp,
          size: datum.sz,
          role: datum.rl,
          skill: 4,
          special: datum.spc,
          class: datum.cl,
          variant: datum.vnt,
        };
        setUnit(unit.type, unit);
      }
    }).catch(err => {
      handleError(`Failed to get bundled def for type ${type}`);
    });
  }
};

imageDBConnection.onsuccess = async event => {
  imageDB = event.target.result;
};

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.pathname === "/Unit/QuickList") {
    event.respondWith(serveOrFetch(event.request));
  }
  else if (url.pathname === "/sw-units") {
    event.respondWith(searchUnits(url));
  }
  else if (url.pathname === "/sw-images") {
    event.respondWith(searchUnits(url));
  }
});
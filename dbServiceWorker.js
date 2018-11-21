let unitDB = null;
let imageDB = null;
let loading = false;
// TODO there doesn't seem to be any DS DA or MS in the MUL?
const unitTypes = ["BM", "IM", "PM", "CV", "SV", "AF", "CF", "DS", "DA", "SC", "MS", "CI", "BA"];
const loadedTypes = [];
const validSearchParams = [
  "unitName",
  "type",
  "minPV",
  "maxPV",
  "unitIds",
  "minPD",
  "maxPD",
  "techLevels",
  "sizes",
];

const handleError = err => {
  console.log(err);
};

const unitDBConnection = indexedDB.open("unitDB", 1);
unitDBConnection.onerror = event => {
  handleError("error opening unitDB");
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

// TODO: create a proper schema, instead of using sqlite as a keystore
unitDBConnection.onupgradeneeded = event => {
  loading = true;
  for (const unitType of unitTypes) {
    event.target.result.createObjectStore(unitType, {keyPath: "name"});
  }
  for (const type of unitTypes) {
      handleError(`Fetching bundled def for type ${type}`);
    fetch(`/defs/${type}-def.json`).then(request => request.text()).then(unParsed => JSON.parse(unParsed)).then(async data => {
      handleError(`Got bundled def for type ${type}`);
      for (const key of Object.keys(data)) {
        const datum = data[key];
        const unit = {
          id: datum.id,
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
          totalOverheat: datum.ov,
          metadata: {
            techLevel: datum.meta.tl,
            productionDate: datum.meta.pd,
          },
        };
        await setUnit(unit.type, unit);
      }
      loadedTypes.push(type);
    }).catch(err => {
      loadedTypes.push(type);
      handleError(`Failed to get bundled def for type ${type}`);
    });
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
  const searchParams = {};
  for (const key of validSearchParams) {
    const value = url.searchParams.get(key.toLowerCase());
    if (value) {
      if (["unitIds", "techLevels", "sizes"].includes(key)) {
        searchParams[key] = value.split(",").map(i => parseInt(i));
      }
      else {
        searchParams[key] = value;
      }
    }
  }
  return new Promise(async (resolve, reject) => {
    let unitsSearched = 0;
    let results = [];
    for (const type of searchParams.types || unitTypes) {
      const units = await getUnits(type);
      for (const unit of units) {
        unitsSearched++;
        let valid = true;
        if (valid && searchParams.unitIds && searchParams.unitIds.length && !searchParams.unitIds.includes(unit.id)) {
          valid = false;
        }
        if (valid && searchParams.unitName && !unit.name.toLowerCase().includes(searchParams.unitName.toLowerCase())) {
          valid = false;
        }
        if (valid && searchParams.minPV && unit.pv < parseInt(searchParams.minPV)) {
          valid = false;
        }
        if (valid && searchParams.maxPV && unit.pv > parseInt(searchParams.maxPV)) {
          valid = false;
        }
        if (valid && searchParams.minPD && unit.metadata.productionDate < parseInt(searchParams.minPD)) {
          valid = false;
        }
        if (valid && searchParams.maxPD && unit.metadata.productionDate > parseInt(searchParams.maxPD)) {
          valid = false;
        }
        if (valid && searchParams.techLevels && searchParams.techLevels.length && !searchParams.techLevels.includes(unit.metadata.techLevel)) {
          valid = false;
        }
        if (valid && searchParams.sizes && searchParams.sizes.length && !searchParams.sizes.includes(unit.size)) {
          valid = false;
        }
        if (valid) {
          results.push(Object.assign(unit, {totalArmor: unit.armor, totalStructure: unit.structure}));
        }
      }
    }
    if (searchParams.unitIds && searchParams.unitIds.length) {
      const resultsCopy = results;
      results = [];
      searchParams.unitIds.map(id => {
        results.push(resultsCopy.find(i => i.id === id));
      });
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

unitDBConnection.onsuccess = async event => {
  self.clients.claim();
  unitDB = event.target.result;
};

imageDBConnection.onsuccess = async event => {
  imageDB = event.target.result;
};

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url.toLowerCase());
  if (url.pathname === "/sw-units") {
    event.respondWith(searchUnits(url));
  }
  // TODO: finish the image cache.  The images are stored on an s3 bucket, with no CORS. so its non-trivial to fetch them
  // Find a hack to pull the images (dump them in canvas, pull out the data, or do the work on the main thread without fetch and save it back to this worker)
  // If that doesnt work, scrap it.
  else if (url.pathname === "/sw-images") {
    event.respondWith(getImage(url));
  }
  else if (url.pathname === "/sw-load-status") {
    event.respondWith(new Response(`${!loading ? 1 : loadedTypes.length / unitTypes.length}`));
  }
  // Cache app assets
  else if (["vaporlynx.github.io", "127.0.0.1"].includes(url.hostName)){
    event.respondWith(serveOrFetch(event.request));
  }
});
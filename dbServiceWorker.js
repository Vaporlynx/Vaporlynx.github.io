let unitDB = null;
let imageDB = null;
const currentRequests = {};
const unitTypes = ["BM", "IM", "PM", "CV", "SV", "AF", "CF", "DS", "DA", "SC", "MS", "CI", "BA"];
const validSearchParams = [
  "name",
  "type",
  "minPV",
  "maxPV",
];
const unitPreCache = ["atlas", "awesome", "catapult"];

const unitDBConnection = indexedDB.open("unitDB", 1);
unitDBConnection.onerror = event => {
  console.log("error opening unitDB");
};

unitDBConnection.onupgradeneeded = event => {
  for (const unitType of unitTypes) {
    event.target.result.createObjectStore(unitType, {keyPath: "name"});
  }
};

const imageDBConnection = indexedDB.open("imageDB", 1);
imageDBConnection.onerror = event => {
  console.log("error opening imageDB");
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
    console.log("data?");
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
    const value = url.searchParams.get(key);
    if (value) {
      searchParams[key] = value;
    }
  }
  return new Promise(async (resolve, reject) => {
    const results = [];
    let unitsSearched = 0;
    for (const type of searchParams.types || unitTypes) {
      const units = await getUnits(type);
      for (const unit of units) {
        unitsSearched++;
        let valid = true;
        if (searchParams.name && !unit.name.toLowerCase().includes(searchParams.name)) {
          valid = false;
        }
        if (searchParams.minPV && unit.pv <= searchParams.minPV) {
          valid = false;
        }
        if (searchParams.maxPV && unit.pv >= searchParams.maxPV) {
          valid = false;
        }
        if (valid) {
          results.push(unit);
        }
      }
    }
    console.log(`UnitsSearched: ${unitsSearched}`);
    const response = new Response(JSON.stringify(results));
    resolve(response);
      const queryString = Object.keys(searchParams).reduce((queryString, key) => {
        return `${queryString}${key}=${searchParams[key]}`;
      }, "?");
      currentRequests[url] = fetch(`http://masterunitlist.info/Unit/QuickList${queryString}`)
        .then(request => request.text()).then(unParsed => JSON.parse(unParsed).Units).then(data => {
        for (const datum of data) {
          const unit = {
            name: datum.Name,
            pv: datum.BFPointValue,
            armor: datum.BFArmor,
            structure: datum.BFStructure,
            damage: {
              short: datum.BFDamageShort,
              medium: datum.BFDamageMedium,
              long: datum.BFDamageLong,
            },
            movement: datum.BFMove,
            image: datum.ImageUrl,
            type: datum.BFType,
            size: datum.BFSize,
            role: datum.Role.Name,
            skill: datum.Skill || 4,
            special: datum.BFAbilities,
            class: datum.Class,
            variant: datum.Variant,
          };
          // Base omnimechs have no type for some reason
          if (unit.type !== null) {
            setUnit(unit.type, unit);
          }
        }
      });
  });
};

unitDBConnection.onsuccess = async event => {
  unitDB = event.target.result;
  // Prefetch most common units
  for (const unit of unitPreCache) {
    const url = new URL(`http://internaldb/?name=${unit}`);
    await searchUnits(url);
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
  else if (url.hostname === "sw-units") {
    event.respondWith(searchUnits(url));
  }
  else if (url.hostname === "sw-images") {
    event.respondWith(searchUnits(url));
  }
});
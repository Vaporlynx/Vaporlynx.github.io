let unitDB = null;
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
  "specials",
  "minSpeed",
  "maxSpeed",
  "minDamage",
  "maxDamage",
  "minTMM",
  "maxTMM",
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

unitDBConnection.onupgradeneeded = event => {
  loading = true;
  for (const unitType of unitTypes) {
    event.target.result.createObjectStore(unitType, {keyPath: "name"});
  }
  for (const type of unitTypes) {
    fetch(`./defs/${type}-def.json`).then(request => request.text()).then(unParsed => JSON.parse(unParsed)).then(async data => {
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

const searchUnits = url => {
  const searchParams = {};
  for (const key of validSearchParams) {
    const value = url.searchParams.get(key.toLowerCase());
    if (value) {
      if (["unitIds", "techLevels", "sizes"].includes(key)) {
        searchParams[key] = value.split(",").map(i => parseInt(i));
      }
      else if (key === "specials") {
        searchParams[key] = value.split(",");
      }
      else {
        searchParams[key] = value;
      }
    }
  }
  return new Promise(async (resolve, reject) => {
    let unitsSearched = 0;
    let results = [];

    // TODO: this should probably be pulled out into a separate function that suggests names as you type
    // const matchedNames = searchParams.unitName && searchParams.unitName.length ? fuse.search(searchParams.unitName) : [];
    for (const type of searchParams.types || unitTypes) {
      const units = await getUnits(type);
      for (const unit of units) {
        unitsSearched++;
        // TODO: these if statements are very similar.  Look at programatic way to organize them, maintain maintainability 
        let valid = true;
        const parsedMove = unit.movement.replace(/[\\"a-z]/ig, "").split("/").map(i => parseInt(i));
        const parsedDamage = [unit.damage.short, unit.damage.medium, unit.damage.long];
        // TODO: web service workers don't support module imports?
        let targetMovementModifier = 0;
        if (parsedMove[0] < 5) {
          targetMovementModifier = 0;
        }
        else if (parsedMove[0] < 9) {
            targetMovementModifier = 1;
        }
        else if (parsedMove[0] < 13) {
            targetMovementModifier = 2;
        }
        else if (parsedMove[0] < 19) {
            targetMovementModifier = 3;
        }
        else if (parsedMove[0] < 35) {
            targetMovementModifier = 4;
        }
        else if (parsedMove[0] >= 35) {
            targetMovementModifier = 5;
        }

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
        if (valid && searchParams.minSpeed && parsedMove.every(i => i < parseInt(searchParams.minSpeed))) {
          valid = false;
        }
        if (valid && searchParams.maxSpeed && parsedMove.every(i => i > parseInt(searchParams.maxSpeed))) {
          valid = false;
        }
        if (valid && searchParams.minDamage && parsedDamage.every(i => i < parseInt(searchParams.minDamage))) {
          valid = false;
        }
        if (valid && searchParams.maxDamage && parsedDamage.every(i => i > parseInt(searchParams.maxDamage))) {
          valid = false;
        }
        if (valid && searchParams.minTMM && targetMovementModifier < parseInt(searchParams.minTMM)) {
          valid = false;
        }
        if (valid && searchParams.maxTMM && targetMovementModifier > parseInt(searchParams.maxTMM)) {
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
        if (valid && searchParams.specials && searchParams.specials.length) {
          for (const special of searchParams.specials) {
            if (!unit.special || !unit.special.toLowerCase().includes(special)) {
              valid = false;
              break;
            }
          }
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
  });
};

unitDBConnection.onsuccess = async event => {
  self.clients.claim();
  unitDB = event.target.result;
};

self.addEventListener("fetch", event => { 
  const url = new URL(event.request.url.toLowerCase());
  if (url.pathname === "/sw-units") {
    event.respondWith(searchUnits(url));
  }
  else if (url.pathname === "/sw-load-status") {
    event.respondWith(new Response(`${!loading ? 1 : loadedTypes.length / unitTypes.length}`));
  }
});
const getUnits = async () => {
    const fs = require("fs");
    const util = require("util");

    const request = require("request-promise-native");

    const write = util.promisify(fs.writeFile);

    const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    const unitsByType = {};

    const searchByString = searchString => {
        return new Promise(async (resolve, reject) => {
            let completed = false;
            setTimeout(() => {
                if (!completed) {
                    reject("TIMEOUT_REACHED");
                }
            }, 60000);
            const workingString = `${searchString}`;
            try {
                 // TODO: look into bug with the request library, it looks like its hitting a timeout then vomiting everywhere
                const unParsed = await request(`http://masterunitlist.info/Unit/QuickList?name=${workingString}`);
                completed = true;
                const parsed = JSON.parse(unParsed);
                let totalFound = parsed.Units.length;
                if (parsed && parsed.Units) {
                    console.log(`${workingString} returned ${parsed.Units.length} results`);
                    for (const Unit of parsed.Units) {
                        const unit = {
                            id: Unit.Id,
                            nm: Unit.Name,
                            pv: Unit.BFPointValue,
                            ar: Unit.BFArmor,
                            st: Unit.BFStructure,
                            da: {
                                s: Unit.BFDamageShort,
                                m: Unit.BFDamageMedium,
                                l: Unit.BFDamageLong,
                            },
                            mv: Unit.BFMove,
                            img: Unit.ImageUrl,
                            tp: Unit.BFType,
                            sz: Unit.BFSize,
                            rl: Unit.Role.Name,
                            spc: Unit.BFAbilities,
                            cl: Unit.Class,
                            vnt: Unit.Variant,
                            ov: Unit.BFOverheat,
                        };
                        if (!unitsByType[unit.tp]) {
                            unitsByType[unit.tp] = {};
                        }
                        unitsByType[unit.tp][unit.nm] = unit;
                    }
                    // Need to dig deeper!
                    if (totalFound > 99) {
                        for (const letter of letters) {
                            totalFound += await searchByString(`${searchString}${letter}`);
                        }
                    }
                    resolve(totalFound);
                }
                else {
                    resolve(0);
                }
            }
            catch (err) {
                reject(err);
            }
        });
    };
    console.log(`Searching, started at ${new Date().toString()}`);
    const words = [];
    for (const vowel of ["a", "e", "i", "o", "u", "y"]) {
        for (const letter of letters) {
            words.push(`${vowel}${letter}`);
        }
    }
    const queryQueue = [];
    const manageQueue = () => {
        if (words.length) {
            if (queryQueue.length < 10) {
                const word = words.pop();
                queryQueue.push(word);
                searchByString(word).then(() => queryQueue.splice(queryQueue.indexOf(word), 1)).catch(err => {
                    console.log(`Search failed for: ${word}, err: ${err}`);
                    queryQueue.splice(queryQueue.indexOf(word), 1);
                    setTimeout(() => {
                        words.push(word);
                    }, 100);
                });
            }
        }
        else if (queryQueue.length === 0) {
            return;
        }
        setTimeout(async () => {
            if (words.length || queryQueue.length) {
                manageQueue();
            }
            else {
                console.log(`Searching, finished at ${new Date().toString()}`);
                for (const key of Object.keys(unitsByType)) {
                    const units = unitsByType[key];
                    await write(`${__dirname}/../defs/${key}-def.json`, JSON.stringify(units));
                }
                console.log(`Finished writing defs at ${new Date().toString()}`);
            }
        }, 1000);
    };
    manageQueue();
};

setTimeout(() => {
    getUnits();
}, 5000);
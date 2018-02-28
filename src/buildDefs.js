const getUnits = async () => {
    const fs = require("fs");
    const util = require("util");

    const request = require("request-promise-native");

    const write = util.promisify(fs.writeFile);

    const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    const unitsByType = {};

    const searchByString = searchString => {
        return new Promise(async (resolve, reject) => {
            const workingString = `${searchString}`;
            const unParsed = await request(`http://masterunitlist.info/Unit/QuickList?name=${workingString}`);
            const parsed = JSON.parse(unParsed);
            let totalFound = parsed.Units.length;
            if (parsed && parsed.Units) {
                console.log(`${workingString} returned ${parsed.Units.length} results`);
                for (const Unit of parsed.Units) {
                    const unit = {
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

        });
    };

    try {
        console.log(`Searching, started at ${new Date().toString()}`);
        await Promise.all([
            searchByString("a"),
            searchByString("e"),
            searchByString("i"),
            searchByString("o"),
            searchByString("u"),
            searchByString("y"),
        ])
        console.log(`Searching, finished at ${new Date().toString()}`);
        for (const key of Object.keys(unitsByType)) {
            const units = unitsByType[key];
            await write(`../defs/${key}-def.json`, JSON.stringify(units));
        }
        console.log(`Finished writing defs at ${new Date().toString()}`);
    }
    catch (err) {
        console.log(`Search failed: ${err}`);
    }
};

setTimeout(() => {
    getUnits();
}, 5000);
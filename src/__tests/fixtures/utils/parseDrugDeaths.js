let fs = require("fs");
let path = require("path");
let _ = require("lodash");
let content = fs.readFileSync(path.join(__dirname, "rawAccidentalDrugDeaths.json"), { encoding: "utf-8" });
let rows = JSON.parse(content).data;
let data = rows.map(row => ({
	date: new Date(row[9]),
	dateType: _.kebabCase(row[10], true),
	age: row[11] ? +row[11] : null,
	sex: _.capitalize(row[12]),
	race: _.capitalize(row[13]),
	city: _.capitalize(row[14]),
	county: _.capitalize(row[15]),
	state: row[16],
	deathCity: _.capitalize(row[17]),
	deathCounty: _.capitalize(row[18]),
	location: ((row[19] || "") + " " + (row[20] || "")).trim(),
	injuryDescription: row[21],
	injuryPlace: row[22],
	injuryCity: _.capitalize(row[23]),
	injuryCounty: _.capitalize(row[24]),
	injuryState: row[25],
	causeOfDeath: row[26],
	otherFactors: row[27],
	drugs: parseDrugs(row),
	mannerOfDeath: _.capitalize(row[45]),
	deathCoords: [row[46][1], row[46][2]],
}));

function parseDrugs(row) {
	let drugsList = [
		"Heroin",
		"Cocaine",
		"Fentanyl",
		"FentanylAnalogue",
		"Oxycodone",
		"Oxymorphone",
		"Hydrocodone",
		"Benzodiazepine",
		"Methadone",
		"Amphet",
		"Morphine_NotHeroin",
		"Hydromorphone",
		"Other",
		"OpiateNOS",
		"AnyOpioid",
	];
	let drugs = [];
	for (var i = 28; i <= drugsList.length + 28; i++) {
		if (row[i]) {
			drugs.push(drugsList[i - 28]);
		}
	}
	return drugs;
}
fs.writeFileSync(
	path.join(__dirname, "drugDeaths.ts"),
	`
export default ${JSON.stringify(data, null, 2)}
`
);

let fs = require("fs");
let path = require("path");
let _ = require("lodash");
let content = fs.readFileSync(path.join(__dirname, "rawNames.json"), { encoding: "utf-8" });
let rows = JSON.parse(content).data;
let data = rows.map(row => ({
	birthYear: +row[8],
	gender: _.capitalize(row[9]),
	ethnicity: _.capitalize(row[10]),
	firstName: _.capitalize(row[11]),
	count: +row[12],
	rank: +row[13],
}));

fs.writeFileSync(
	path.join(__dirname, "babyNames.ts"),
	`
export default ${JSON.stringify(data, null, 2)}
`
);

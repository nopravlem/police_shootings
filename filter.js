d3.csv("locations.csv", function(data) {
	var dataset = data;
	// console.log(dataset);

	//Memale-->Asian
	var afiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "Asian") && (d["body_camera"] == "FALSE") && (d["age"] == "NULL"))  { // "FALSE"  "FALSE"
			return true;
		} else {
			return false;
		}
	})

	console.log(afiltered_data);

	//Memale-->Black
	var bfiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "Black") && (d["body_camera"] == "FALSE") && (d["age"] == "NULL"))  { // "FALSE"  "FALSE"
			return true;
		} else {
			return false;
		}
	})

	console.log(bfiltered_data);

	//Memale-->Hispanic
	var cfiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "Hispanic") && (d["body_camera"] == "FALSE") && (d["age"] == "NULL"))  { // "FALSE"  "FALSE"
			return true;
		} else {
			return false;
		}
	})

	console.log(cfiltered_data);

	//Memale-->Native American
	var dfiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "Native American") && (d["body_camera"] == "FALSE") && (d["age"] == "NULL"))  { // "FALSE"  "FALSE"
			return true;
		} else {
			return false;
		}
	})

	console.log(dfiltered_data);

	//Memale-->Other
	var efiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "Other") && (d["body_camera"] == "FALSE") && (d["age"] == "NULL"))  { // "FALSE"  "FALSE"
			return true;
		} else {
			return false;
		}
	})

	console.log(efiltered_data);

	//Memale-->White
	var ffiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "White") && (d["body_camera"] == "FALSE") && (d["age"] == "NULL"))  { // "FALSE"  "FALSE"
			return true;
		} else {
			return false;
		}
	})

	console.log(ffiltered_data);

	//Memale-->White
	var ffiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "NULL") && (d["body_camera"] == "FALSE") && (d["age"] == "NULL"))  { // "FALSE"  "FALSE"
			return true;
		} else {
			return false;
		}
	})

	console.log(ffiltered_data);

});
d3.csv("locations.csv", function(data) {
	var dataset = data;
	// console.log(dataset);

	//Female-->Asain
	var afiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "F") && (d["race"] == "NULL") && (d["body_camera"] == "TRUE"))  { // "FALSE"  "TRUE"
			var age = +d["age"];
			if (age >= 1){
				return true;
			} else {1
				return false;
			}
		} else {
			return false;
		}
	})

	console.log(afiltered_data);

	//Female-->Black
	var bfiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "F") && (d["race"] == "Black") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (age >= 60){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	})

	console.log(bfiltered_data);

	//Female-->Hispanic
	var cfiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "F") && (d["race"] == "Hispanic") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (age >= 60){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	})

	console.log(cfiltered_data);

	//Female-->Native American
	var dfiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "F") && (d["race"] == "Native American") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (age >= 60){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	})

	console.log(dfiltered_data);

	//Female-->Other
	var efiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "F") && (d["race"] == "Other") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (age >= 60){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	})

	console.log(efiltered_data);

	//Female-->White
	var ffiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "F") && (d["race"] == "White") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (age >= 60){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	})

	console.log(ffiltered_data);

});
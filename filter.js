d3.csv("locations.csv", function(data) {
	var dataset = data;
	// console.log(dataset);

	//Female-->Asian
	var afiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "Asian") && (d["body_camera"] == "FALSE"))  { // "FALSE"  "TRUE"
			var age = +d["age"];
			if (50 <= age && age >= 59){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	})

	console.log(afiltered_data);

	//Female-->Black
	var bfiltered_data = dataset.filter(function (d) {
		if((d["gender"] == "M") && (d["race"] == "Black") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (50 <= age && age >= 59){
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
		if((d["gender"] == "M") && (d["race"] == "Hispanic") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (50 <= age && age >= 59){
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
		if((d["gender"] == "M") && (d["race"] == "Native American") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (50 <= age && age >= 59){
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
		if((d["gender"] == "M") && (d["race"] == "Other") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (50 <= age && age >= 59){
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
		if((d["gender"] == "M") && (d["race"] == "White") && (d["body_camera"] == "FALSE"))  {
			var age = +d["age"];
			if (50 <= age && age >= 59){
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
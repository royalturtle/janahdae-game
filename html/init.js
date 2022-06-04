var player_small_icon_list = [new Image(78, 78)];

for (const index of Array(30).keys()) {
	var newIndex = index + 1;
	var newImage = new Image(78, 78);
	newImage.src = player_list[newIndex]["icon-small"];
	player_small_icon_list.push(newImage);
	
	var bigImage = document.getElementById("player_img_" + (newIndex));
	bigImage.src = player_list[newIndex]["icon-big"];
}

for (const index of Array(5).keys()) {
	var positionImage = document.getElementById("position_icon_" + position_dict[index]["name"]);
	positionImage.src = position_dict[index]["icon"];
}

for (const index of Array(9).keys()) {
	var tierImage = document.getElementById("tier_icon_" + tier_list[index+1]["name"]);
	tierImage.src = tier_list[index+1]["icon"];
}
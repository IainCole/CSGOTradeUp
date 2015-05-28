
var getSkinByName = function(data, name) {
	for (var p in data.paint_kits) {
		if (data.paint_kits[p].name === name) {
			return data.paint_kits[p];
		}
	}

	return null;
}

var getItemByName = function (data, name) {
	for (var p in data.items) {
		if (data.items[p].name === name) {
			return data.items[p];
		}
	}

	return null;
}

var getWeaponByName = function (data, name) {
	var item = getItemByName(data, name);

	if (item) {
		for (var p in data.prefabs) {
			if (p === item.prefab) {
				return data.prefabs[p];
			}
		}
	}

	return null;
}

var getSkinRarity = function(data, setName, name, rawName) {
	var defaultRarity = null;

	for (var p in data.paint_kits_rarity) {
		if (p === name) {
			defaultRarity = data.paint_kits_rarity[p];
			break;
		}
	}

	var re = new RegExp('^' + setName + '_(.+)$');

	for (var p in data.client_loot_lists) {
		if (p.match(re)) {
			if (data.client_loot_lists[p].hasOwnProperty(rawName)) {
				defaultRarity = p.match(re)[1];
				break;
			}
		}
	}

	return data.rarities[defaultRarity].loc_key_weapon;
}


var getTranslation = function(translations, id) {
	return translations[id.replace(/^#/, '')];
}

$.ajax({
	url: 'http://cdn.rawgit.com/SteamDatabase/GameTracking/master/731/csgo_english_utf8.txt',
	success: function(data) {
		var translations = VDF.parse(data).lang.Tokens;


		$.ajax({
			url: 'http://cdn.rawgit.com/SteamDatabase/GameTracking/master/731/items_game.txt',
			success: function (data) {
				var obj = VDF.parse(data).items_game;

				for (var p in obj.items) {
					if (obj.items[p].prefab == 'weapon_case' && obj.items[p].tags.hasOwnProperty('ItemSet')) {
						var caseContainer = $('<div class="case"></div>');
						caseContainer.append('<h2>' + getTranslation(translations, obj.items[p].item_name));
						$('#container').append(caseContainer);

						var setName = obj.items[p].tags.ItemSet.tag_value;
						var set = obj.item_sets[setName];

						var weaponsContainer = $('<div class="weapons"></div>');
						caseContainer.append(weaponsContainer);

						for (var s in set.items) {
							var skinName = s.replace(/^\[([^\]]+)\].+$/, '$1');
							var weaponName = s.replace(/^\[([^\]]+)\](.+)$/, '$2');
							
							var skin = getSkinByName(obj, skinName);

							if (skin) {
								var weapon = getWeaponByName(obj, weaponName);

								if (weapon) {
									var rarity = getSkinRarity(obj, obj.items[p].name, skinName, s);
									var rarityName = getTranslation(translations, rarity);

									if (rarityName) {

										var searchTerm = getTranslation(translations, weapon.item_name) + ' | ' + getTranslation(translations, skin.description_tag) + ' (Battle-Scarred)';

										if (false && (rarity == 'Rarity_Legendary_Weapon' || rarity == 'Rarity_Ancient_Weapon')) {
											$.ajax({
												url: 'http://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=' + encodeURIComponent(searchTerm),
												success: function (data) {
													data = JSON.parse(data);
													weaponsContainer.append('<p>' + getTranslation(translations, weapon.item_name) + ' | ' + getTranslation(translations, skin.description_tag) + ' - ' + rarityName + ' - Cheapest Price: $' + data.lowest_price + '</p>');
												}
											});
										} else {
											weaponsContainer.append('<p>' + getTranslation(translations, weapon.item_name) + ' | ' + getTranslation(translations, skin.description_tag) + ' - ' + rarityName + '</p>');
										}

										
									}
								}
							}
						}
					}
				}
			}
		});
	}
});


function Player(player_id) {
    var player = this;
    player.role = "player";
    player.money = 1000;
    player.id = player_id;
    player.ready = false;
    player.lineup_list = [-1, -1, -1, -1, -1];
    player.empty_space = 5;
}

module.exports = Player;